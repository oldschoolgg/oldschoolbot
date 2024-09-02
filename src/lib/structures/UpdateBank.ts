import type { GearSetupType, Prisma } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { objectEntries } from 'e';
import { mergeDeep } from 'remeda';
import { userStatsUpdate } from '../../mahoji/mahojiSettings';
import { degradeChargeBank } from '../degradeableItems';
import type { GearSetup } from '../gear/types';
import type { ItemBank } from '../types';
import { objHasAnyPropInCommon } from '../util';
import { ChargeBank, KCBank, XPBank } from './Bank';

export class UpdateBank {
	// Things removed
	public chargeBank: ChargeBank = new ChargeBank();
	public itemCostBank: Bank = new Bank();

	// Things added
	public itemLootBank: Bank = new Bank();
	public xpBank: XPBank = new XPBank();
	public kcBank: KCBank = new KCBank();

	// Things changed
	public gearChanges: Partial<Record<GearSetupType, GearSetup>> = {};
	public userStats: Omit<Prisma.UserStatsUpdateInput, 'user_id'> = {};
	public userUpdates: Pick<Prisma.UserUpdateInput, 'slayer_points'> = {};

	public merge(other: UpdateBank) {
		this.chargeBank.add(other.chargeBank);
		this.itemCostBank.add(other.itemCostBank);
		this.itemLootBank.add(other.itemLootBank);
		this.xpBank.add(other.xpBank);
		this.kcBank.add(other.kcBank);

		if (objHasAnyPropInCommon(this.gearChanges, other.gearChanges)) {
			throw new Error('Gear changes conflict');
		}
		if (objHasAnyPropInCommon(this.userStats, other.userStats)) {
			throw new Error('User stats conflict');
		}
		if (objHasAnyPropInCommon(this.userUpdates, other.userUpdates)) {
			throw new Error('User updates conflict');
		}
		this.gearChanges = mergeDeep(this.gearChanges, other.gearChanges);
		this.userStats = mergeDeep(this.userStats, other.userStats);
		// this.userUpdates = mergeDeep(this.userUpdates, other.userUpdates);
	}

	async transact(user: MUser) {
		// Check everything first
		if (this.chargeBank.length() > 0) {
			const charges = user.hasCharges(this.chargeBank);
			if (!charges.hasCharges) {
				return { error: charges.fullUserString! };
			}
		}

		if (this.itemCostBank.length > 0 && !user.bank.has(this.itemCostBank)) {
			return { error: `You need these items: ${this.itemCostBank}` };
		}

		// Start removing/updating things
		const promises = [];

		// Charges
		if (this.chargeBank.length() > 0) {
			promises.push(degradeChargeBank(user, this.chargeBank).then(res => res.map(p => p.userMessage).join(', ')));
		}

		// Loot/Cost
		if (this.itemCostBank.length > 0 || this.itemLootBank.length > 0) {
			promises.push(
				user.transactItems({
					itemsToAdd: this.itemLootBank,
					itemsToRemove: this.itemCostBank,
					collectionLog: true
				})
			);
		}

		// XP
		if (this.xpBank.length > 0) {
			promises.push(user.addXPBank(this.xpBank));
		}

		// KC
		if (this.kcBank.length() > 0) {
			const currentScores = (await user.fetchStats({ monster_scores: true })).monster_scores as ItemBank;
			for (const [monster, kc] of this.kcBank.entries()) {
				currentScores[monster] = (currentScores[monster] ?? 0) + kc;
			}
			promises.push(
				userStatsUpdate(user.id, {
					monster_scores: currentScores
				})
			);
		}

		// User stats
		if (Object.keys(this.userStats).length > 0) {
			promises.push(userStatsUpdate(user.id, this.userStats));
		}

		const userUpdates: Prisma.UserUpdateInput = this.userUpdates;

		// Gear
		for (const [key, v] of objectEntries(this.gearChanges)) {
			userUpdates[`gear_${key}`] = v! as Prisma.InputJsonValue;
		}

		if (Object.keys(userUpdates).length > 0) {
			promises.push(user.update(userUpdates));
		}

		const results = await Promise.all(promises);
		return {
			rawResults: results,
			message: results.filter(r => typeof r === 'string').join(', ')
		};
	}
}
