import type { GearSetupType, Prisma, UserStats } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { objectEntries } from 'e';
import { mergeDeep } from 'remeda';
import { type trackClientBankStats, userStatsUpdate } from '../../mahoji/mahojiSettings';
import type { MUserClass } from '../MUser';
import { degradeChargeBank } from '../degradeableItems';
import type { GearSetup } from '../gear/types';
import { MaterialBank } from '../invention/MaterialBank';
import { transactMaterialsFromUser } from '../invention/inventions';
import type { ItemBank } from '../types';
import { type JsonKeys, objHasAnyPropInCommon } from '../util';
import { ChargeBank, XPBank } from './Bank';
import { KCBank } from './KCBank';

export class UpdateBank {
	// Things removed
	public chargeBank: ChargeBank = new ChargeBank();
	public itemCostBank: Bank = new Bank();
	public materialsCostBank: MaterialBank = new MaterialBank();

	// Things added
	public itemLootBank: Bank = new Bank();
	public xpBank: XPBank = new XPBank();
	public kcBank: KCBank = new KCBank();
	public itemLootBankNoCL: Bank = new Bank();

	// Things changed
	public gearChanges: Partial<Record<GearSetupType, GearSetup>> = {};
	public userStats: Omit<Prisma.UserStatsUpdateInput, 'user_id'> = {};
	public userStatsBankUpdates: Partial<Record<JsonKeys<UserStats>, Bank>> = {};
	public userUpdates: Pick<Prisma.UserUpdateInput, 'slayer_points'> = {};

	public clientStatsBankUpdates: Partial<Record<Parameters<typeof trackClientBankStats>['0'], Bank>> = {};

	public merge(other: UpdateBank) {
		this.chargeBank.add(other.chargeBank);
		this.itemCostBank.add(other.itemCostBank);
		this.itemLootBank.add(other.itemLootBank);
		this.xpBank.add(other.xpBank);
		this.kcBank.add(other.kcBank);
		this.materialsCostBank.add(other.materialsCostBank);
		this.itemLootBankNoCL.add(other.itemLootBankNoCL);
		this.userStatsBankUpdates = mergeDeep(this.userStatsBankUpdates, other.userStatsBankUpdates);
		this.clientStatsBankUpdates = mergeDeep(this.clientStatsBankUpdates, other.clientStatsBankUpdates);

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
		this.userUpdates = mergeDeep(this.userUpdates, other.userUpdates);
	}

	async transact(user: MUser, { isInWilderness }: { isInWilderness?: boolean } = { isInWilderness: false }) {
		// Check everything first
		if (this.chargeBank.length() > 0) {
			const charges = user.hasCharges(this.chargeBank);
			if (!charges.hasCharges) {
				return charges.fullUserString!;
			}
		}

		if (this.itemCostBank.length > 0 && !user.bank.has(this.itemCostBank)) {
			return `You need these items: ${this.itemCostBank}`;
		}

		// Start removing/updating things
		const promises = [];

		// Charges
		if (this.chargeBank.length() > 0) {
			promises.push(degradeChargeBank(user, this.chargeBank).then(res => res.map(p => p.userMessage).join(', ')));
		}

		// Loot/Cost
		if (this.itemCostBank.length > 0) {
			await user.specialRemoveItems(this.itemCostBank, { isInWilderness });
		}
		let itemTransactionResult: Awaited<ReturnType<MUserClass['addItemsToBank']>> | null = null;
		if (this.itemLootBank.length > 0) {
			itemTransactionResult = await user.addItemsToBank({ items: this.itemLootBank, collectionLog: true });
		}

		// XP
		if (this.xpBank.length > 0) {
			promises.push(user.addXPBank(this.xpBank));
		}

		let userStatsUpdates: Prisma.UserStatsUpdateInput = {};
		// KC
		if (this.kcBank.length() > 0) {
			const currentScores = (await user.fetchStats({ monster_scores: true })).monster_scores as ItemBank;
			for (const [monster, kc] of this.kcBank.entries()) {
				currentScores[monster] = (currentScores[monster] ?? 0) + kc;
			}
			userStatsUpdates.monster_scores = currentScores;
		}

		// User stats
		if (Object.keys(this.userStats).length > 0) {
			userStatsUpdates = mergeDeep(userStatsUpdates, this.userStats);
		}
		if (Object.keys(userStatsUpdates).length > 0) {
			const currentStats = await prisma.userStats.upsert({
				where: {
					user_id: BigInt(user.id)
				},
				create: { user_id: BigInt(user.id) },
				update: {}
			});
			for (const [key, value] of objectEntries(this.userStatsBankUpdates)) {
				const newValue = new Bank((currentStats[key] ?? {}) as ItemBank).add(value);
				userStatsUpdates[key] = newValue.bank;
			}
		}

		await userStatsUpdate(user.id, userStatsUpdates);

		const userUpdates: Prisma.UserUpdateInput = this.userUpdates;

		// Gear
		for (const [key, v] of objectEntries(this.gearChanges)) {
			userUpdates[`gear_${key}`] = v! as Prisma.InputJsonValue;
		}

		if (Object.keys(userUpdates).length > 0) {
			promises.push(user.update(userUpdates));
		}

		const results = await Promise.all(promises);

		if (this.materialsCostBank.values().length > 0) {
			await transactMaterialsFromUser({
				user,
				remove: this.materialsCostBank
			});
			results.push(`Removed ${this.materialsCostBank}`);
		}

		if (this.itemLootBankNoCL.length > 0) {
			await user.transactItems({ itemsToAdd: this.itemLootBankNoCL, collectionLog: false });
		}

		await user.sync();
		return {
			itemTransactionResult,
			rawResults: results,
			message: results.filter(r => typeof r === 'string').join(', ')
		};
	}
}
