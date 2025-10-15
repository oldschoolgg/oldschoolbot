import { objectEntries } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';

import { degradeChargeBank } from '@/lib/degradeableItems.js';
import type { GearSetup } from '@/lib/gear/types.js';
import type { MUserClass } from '@/lib/MUser.js';
import { ChargeBank } from '@/lib/structures/Bank.js';
import { KCBank } from '@/lib/structures/KCBank.js';
import { XPBank } from '@/lib/structures/XPBank.js';
import type { JsonKeys } from '@/lib/util.js';
import type { GearSetupType, Prisma, UserStats } from '@/prisma/main.js';

export class UpdateBank {
	// Things removed
	public chargeBank: ChargeBank = new ChargeBank();
	public itemCostBank: Bank = new Bank();

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

	async transact(user: MUser, { isInWilderness }: { isInWilderness?: boolean } = { isInWilderness: false }) {
		// Check everything first
		if (this.chargeBank.length() > 0) {
			const charges = user.hasCharges(this.chargeBank);
			if (!charges.hasCharges) {
				return charges.fullUserString!;
			}
		}

		if (this.itemCostBank.length > 0 && !user.allItemsOwned.has(this.itemCostBank)) {
			return `You need these items: ${this.itemCostBank}`;
		}

		// Start removing/updating things
		const results: string[] = [];

		// Charges
		if (this.chargeBank.length() > 0) {
			const degradeResults = await degradeChargeBank(user, this.chargeBank);
			if (degradeResults) {
				results.push(degradeResults);
			}
		}

		// Loot/Cost
		const totalCost = new Bank();
		if (this.itemCostBank.length > 0) {
			const { realCost } = await user.specialRemoveItems(this.itemCostBank, { isInWilderness });
			totalCost.add(realCost);
		}
		let itemTransactionResult: Awaited<ReturnType<MUserClass['addItemsToBank']>> | null = null;
		if (this.itemLootBank.length > 0) {
			itemTransactionResult = await user.addItemsToBank({ items: this.itemLootBank, collectionLog: true });
		}

		// XP
		if (this.xpBank.length > 0) {
			results.push(await user.addXPBank(this.xpBank));
		}

		const userStatsUpdates: Prisma.UserStatsUpdateInput = this.userStats ?? {};

		// KC
		if (this.kcBank.length() > 0) {
			const currentScores = (await user.fetchStats()).monster_scores as ItemBank;
			for (const [monster, kc] of this.kcBank.entries()) {
				currentScores[monster] = (currentScores[monster] ?? 0) + kc;
			}
			userStatsUpdates.monster_scores = currentScores;
		}

		if (Object.keys(this.userStatsBankUpdates).length > 0) {
			const currentStats = await prisma.userStats.upsert({
				where: {
					user_id: BigInt(user.id)
				},
				create: { user_id: BigInt(user.id) },
				update: {}
			});
			for (const [key, value] of objectEntries(this.userStatsBankUpdates)) {
				const newValue = new Bank((currentStats[key] ?? {}) as ItemBank).add(value);
				userStatsUpdates[key] = newValue.toJSON();
			}
		}

		await user.statsUpdate(userStatsUpdates);

		const userUpdates: Prisma.UserUpdateInput = this.userUpdates;

		// Gear
		for (const [key, v] of objectEntries(this.gearChanges)) {
			userUpdates[`gear_${key}`] = v! as Prisma.InputJsonValue;
		}

		if (Object.keys(userUpdates).length > 0) {
			await user.update(userUpdates);
		}

		if (this.itemLootBankNoCL.length > 0) {
			await user.transactItems({ itemsToAdd: this.itemLootBankNoCL, collectionLog: false });
		}

		await user.sync();
		return {
			itemTransactionResult,
			totalCost,
			rawResults: results,
			message: results.filter(r => typeof r === 'string').join(', ')
		};
	}
}
