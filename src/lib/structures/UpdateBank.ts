import { objectEntries } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';

import type { Prisma, UserStats } from '@/prisma/main.js';
import { degradeChargeBank } from '@/lib/degradeableItems.js';
import { ChargeBank } from '@/lib/structures/Bank.js';
import { KCBank } from '@/lib/structures/KCBank.js';
import { XPBank } from '@/lib/structures/XPBank.js';
import type { SafeUserUpdateInput } from '@/lib/user/update.js';
import type { GearWithSetupType } from '@/lib/user/userTypes.js';
import { fetchUserStats } from '@/lib/util/fetchUserStats.js';
import type { JsonKeys } from '@/lib/util.js';

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
	public gearChanges: GearWithSetupType[] = [];
	public userStats: Omit<Prisma.UserStatsUpdateInput, 'user_id'> = {};
	public userStatsBankUpdates: Partial<Record<JsonKeys<UserStats>, Bank>> = {};
	public userUpdates: SafeUserUpdateInput = {};

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
		let itemTransactionResult: Awaited<ReturnType<MUser['addItemsToBank']>> | null = null;
		if (this.itemLootBank.length > 0) {
			itemTransactionResult = await user.transactItems({ itemsToAdd: this.itemLootBank, collectionLog: true });
		}

		// XP
		if (this.xpBank.length > 0) {
			results.push(await user.addXPBank(this.xpBank));
		}

		const userStatsUpdates: Prisma.UserStatsUpdateInput = this.userStats ?? {};

		// KC
		if (this.kcBank.length() > 0) {
			const currentScores = (await user.fetchUserStat('monster_scores')) as ItemBank;
			for (const [monster, kc] of this.kcBank.entries()) {
				currentScores[monster] = (currentScores[monster] ?? 0) + kc;
			}
			userStatsUpdates.monster_scores = currentScores;
		}

		if (Object.keys(this.userStatsBankUpdates).length > 0) {
			const currentStats = await fetchUserStats(user.id);
			for (const [key, value] of objectEntries(this.userStatsBankUpdates)) {
				const newValue = new Bank((currentStats[key] ?? {}) as ItemBank).add(value);
				userStatsUpdates[key] = newValue.toJSON();
			}
		}

		await user.statsUpdate(userStatsUpdates);

		const userUpdates: SafeUserUpdateInput = this.userUpdates;

		// Gear
		if (this.gearChanges.length > 0) {
			const gearChanges = user.getGearUpdateData(this.gearChanges);
			for (const [key, value] of objectEntries(gearChanges)) {
				// @ts-expect-error TODO
				userUpdates[key] = value;
			}
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
