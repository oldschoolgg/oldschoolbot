import { increaseNumByPercent, percentChance, sumArr, Time } from '@oldschoolgg/toolkit';
import { Bank, Items, toKMB } from 'oldschooljs';

import { InventionID, inventionBoosts, inventionItemBoostRaw } from '@/lib/bso/skills/invention/inventions.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { BitField } from '@/lib/constants.js';
import Prayer from '@/lib/skilling/skills/prayer.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import type { UpdateBank } from '@/lib/structures/UpdateBank.js';
import { assert } from '@/lib/util/logError.js';

export function clueUpgraderEffect({
	gearBank,
	messages,
	disabledInventions,
	updateBank,
	type
}: {
	disabledInventions: number[];
	gearBank: GearBank;
	updateBank: UpdateBank;
	messages: string[];
	bitfield: BitField[] | readonly BitField[];
	type: 'pvm' | 'pickpocketing';
}) {
	if (!gearBank.bank.has('Clue upgrader') || disabledInventions.includes(InventionID.ClueUpgrader)) return false;
	const upgradedClues = new Bank();
	const removeBank = new Bank();
	let durationForCost = 0;

	const fn = type === 'pvm' ? inventionBoosts.clueUpgrader.chance : inventionBoosts.clueUpgrader.pickPocketChance;
	for (let i = 0; i < 5; i++) {
		const clueTier = ClueTiers[i];
		if (!updateBank.itemLootBank.has(clueTier.scrollID)) continue;
		for (let t = 0; t < updateBank.itemLootBank.amount(clueTier.scrollID); t++) {
			if (percentChance(fn(clueTier))) {
				removeBank.add(clueTier.scrollID);
				upgradedClues.add(ClueTiers[i + 1].scrollID);
				durationForCost += inventionBoosts.clueUpgrader.durationCalc(clueTier);
			}
		}
	}
	if (upgradedClues.length === 0) return false;
	const boostRes = inventionItemBoostRaw({
		gearBank,
		inventionID: InventionID.ClueUpgrader,
		duration: durationForCost,
		disabledInventions
	});
	if (!boostRes.success) return false;
	updateBank.clientStatsBankUpdates.clue_upgrader_loot = upgradedClues;
	updateBank.userStatsBankUpdates.clue_upgrader_bank = upgradedClues;
	updateBank.itemLootBank.add(upgradedClues);
	assert(updateBank.itemLootBank.has(removeBank));
	updateBank.itemLootBank.remove(removeBank);
	updateBank.materialsCostBank.add(boostRes.materialCost!);
	const totalCluesUpgraded = sumArr(upgradedClues.items().map(i => i[1]));
	messages.push(`<:Clue_upgrader:986830303001722880> Upgraded ${totalCluesUpgraded} clues (${boostRes.messages})`);
}

const hideLeatherMap = [
	[Items.getOrThrow('Green dragonhide'), Items.getOrThrow('Green dragon leather')],
	[Items.getOrThrow('Blue dragonhide'), Items.getOrThrow('Blue dragon leather')],
	[Items.getOrThrow('Red dragonhide'), Items.getOrThrow('Red dragon leather')],
	[Items.getOrThrow('Black dragonhide'), Items.getOrThrow('Black dragon leather')],
	[Items.getOrThrow('Royal dragonhide'), Items.getOrThrow('Royal dragon leather')]
] as const;

export function portableTannerEffect({
	gearBank,
	duration,
	messages,
	disabledInventions,
	updateBank
}: {
	disabledInventions: number[];
	gearBank: GearBank;
	updateBank: UpdateBank;
	duration: number;
	messages: string[];
	bitfield: BitField[] | readonly BitField[];
}) {
	if (!gearBank.bank.has('Portable tanner')) return;
	const boostRes = inventionItemBoostRaw({
		gearBank,
		inventionID: InventionID.PortableTanner,
		duration,
		disabledInventions
	});

	if (!boostRes.success || !boostRes.materialCost) return;

	const toAdd = new Bank();
	for (const [hide, leather] of hideLeatherMap) {
		const qty = updateBank.itemLootBank.amount(hide.id);
		if (qty > 0) {
			updateBank.itemLootBank.remove(hide.id, qty);
			toAdd.add(leather.id, qty);
		}
	}

	if (toAdd.length === 0) return;

	updateBank.userStatsBankUpdates.portable_tanner_bank = toAdd;
	updateBank.clientStatsBankUpdates.portable_tanner_loot = toAdd;
	updateBank.itemLootBank.add(toAdd);
	updateBank.materialsCostBank.add(boostRes.materialCost);
	messages.push(`Portable Tanner turned the hides into leathers (${boostRes.messages})`);
}

export function bonecrusherEffect({
	gearBank,
	duration,
	messages,
	bitfield,
	disabledInventions,
	updateBank
}: {
	disabledInventions: number[];
	gearBank: GearBank;
	updateBank: UpdateBank;
	duration: number;
	messages: string[];
	bitfield: BitField[] | readonly BitField[];
}) {
	if (!gearBank.hasEquippedOrInBank(['Gorajan bonecrusher', 'Superior bonecrusher'], 'one')) return;
	if (bitfield.includes(BitField.DisabledGorajanBoneCrusher)) return;
	let hasSuperior = gearBank.bank.has('Superior bonecrusher');

	let totalXP = 0;
	for (const bone of Prayer.Bones) {
		const amount = updateBank.itemLootBank.amount(bone.inputId);
		if (amount > 0) {
			totalXP += bone.xp * amount * 4;
			updateBank.itemLootBank.remove(bone.inputId, amount);
		}
	}
	if (totalXP === 0) return;

	const durationForCost = totalXP * 16.8;
	const inventionResult =
		hasSuperior && durationForCost > Time.Minute
			? inventionItemBoostRaw({
					gearBank,
					inventionID: InventionID.SuperiorBonecrusher,
					duration: durationForCost,
					disabledInventions
				})
			: { success: false };

	if (!inventionResult.success || !inventionResult.materialCost) {
		hasSuperior = false;
	} else {
		totalXP = increaseNumByPercent(totalXP, inventionBoosts.superiorBonecrusher.xpBoostPercent);
		updateBank.materialsCostBank.add(inventionResult.materialCost);
	}

	totalXP *= 5;

	updateBank.userStats.bonecrusher_prayer_xp = {
		increment: Math.floor(totalXP)
	};

	updateBank.xpBank.add('prayer', totalXP, { duration, minimal: true, multiplier: false });

	messages.push(
		`${toKMB(totalXP)} Prayer XP ${
			hasSuperior
				? `+${inventionBoosts.superiorBonecrusher.xpBoostPercent}% more from Superior bonecrusher${
						inventionResult.messages ? ` (${inventionResult.messages.join(', ')})` : ''
					}`
				: ' from Gorajan bonecrusher'
		}`
	);
}
