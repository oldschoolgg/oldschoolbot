import { InventionID, inventionBoosts, inventionItemBoostRaw } from '@/lib/bso/skills/invention/inventions.js';

import { percentChance } from '@oldschoolgg/rng';
import { sumArr } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import type { BitField } from '@/lib/constants.js';
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
