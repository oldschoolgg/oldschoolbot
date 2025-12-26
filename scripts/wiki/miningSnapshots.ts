import { calcPerHour, Table, Time } from '@oldschoolgg/toolkit';
import { Bank, convertLVLtoXP } from 'oldschooljs';
import { uniqueBy } from 'remeda';

import '../base.js';

import { MathRNG } from '@oldschoolgg/rng';

import { calculateMiningInput } from '@/mahoji/commands/mine.js';
import { calculateMiningResult } from '@/tasks/minions/miningActivity.js';
import { ClueTiers } from '../../src/lib/clues/clueTiers.js';
import Mining from '../../src/lib/skilling/skills/mining.js';
import type { Ore } from '../../src/lib/skilling/types.js';
import { FloatBank } from '../../src/lib/structures/Bank.js';
import { makeGearBank } from '../../tests/unit/utils.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

function bankToPerHour(bank: Bank, duration: number): FloatBank {
	const perHourBank = new FloatBank();
	for (const [item, qty] of bank.items()) {
		perHourBank.add(item.id, qty / (duration / Time.Hour));
	}
	return perHourBank;
}

function main() {
	const gearBank = makeGearBank();

	gearBank.gear.skilling.equip('Varrock armour 4');
	gearBank.gear.skilling.equip('Expert mining gloves');
	gearBank.gear.skilling.equip('Crystal pickaxe');
	gearBank.skillsAsLevels.crafting = 99;

	const results: {
		xpHr: number;
		ore: Ore;
		isPowermining: boolean;
		others: string[];
		level: number;
		itemsPerHour: FloatBank;
	}[] = [];

	for (const level of [1, 10, 40, 70, 80, 90, 99]) {
		gearBank.skillsAsLevels.mining = level;
		gearBank.skillsAsXP.mining = convertLVLtoXP(level);
		for (const ore of Mining.Ores) {
			for (const isPowermining of [true, false]) {
				for (const hasFinishedCOTS of [true, false]) {
					for (const hasKaramjaMedium of [true, false]) {
						if (hasFinishedCOTS && ore.name !== 'Runite ore') continue;
						if (hasKaramjaMedium && ore.name !== 'Gem rock') continue;
						if (ore.level > level) continue;

						const others: string[] = [];
						if (hasKaramjaMedium && ore.name === 'Gem rock') {
							others.push('Karamja Medium');
						}
						if (hasFinishedCOTS && ore.name === 'Runite ore') {
							others.push('COTS');
						}

						const tripLengthHours = 1000;

						const trip = calculateMiningInput({
							quantityInput: undefined,
							nameInput: ore.name,
							maxTripLength: Time.Hour * tripLengthHours,
							isPowermining,
							hasKaramjaMedium,
							randomVariationEnabled: false,
							qp: 5000,
							miningLevel: level,
							hasSOTFQuest: true,
							craftingLevel: 120,
							gearBank,
							strengthLevel: 120,
							hasDT2Quest: true
						});
						if (typeof trip === 'string') {
							console.warn(`Skipping ${ore.name} for level ${level} (${trip})`);
							continue;
						}
						const result = calculateMiningResult({
							ore,
							quantity: trip.newQuantity,
							gearBank,
							duration: trip.duration,
							isPowermining,
							disabledInventions: [],
							isUsingObsidianPickaxe: true,
							collectionLog: new Bank(),
							hasMiningMasterCape: true,
							portentResult: null,
							amountOfSpiritsToUse: 0,
							spiritOre: undefined,
							rng: MathRNG
						});
						result.loot.remove('Rock golem', 1000);
						result.loot.remove('Loop half of key (moon key)', 1000);

						for (const clueTier of ClueTiers) {
							result.loot.remove(clueTier.scrollID, result.loot.amount(clueTier.scrollID));
						}

						const xp = result.totalMiningXPToAdd;
						let xpHr = calcPerHour(xp, trip.duration);
						// Round down to nearest 1000
						xpHr = Math.floor(xpHr / 1000) * 1000;

						results.push({
							xpHr,
							ore,
							isPowermining,
							others,
							level,
							itemsPerHour: bankToPerHour(result.loot, trip.duration)
						});
					}
				}
			}
		}
	}

	results.sort((a, b) => a.ore.name.localeCompare(b.ore.name));
	results.sort((a, b) => b.xpHr - a.xpHr);

	const table = new Table();
	table.addHeader('Ore', 'Mining Lvl', 'XP/hr', 'Powermining', 'Other', 'Items/hr');

	for (const result of uniqueBy(results, r => `${r.ore.name}-${r.xpHr}`)) {
		table.addRow(
			`${result.ore.name}`,
			result.level.toString(),
			result.xpHr.toLocaleString(),
			result.isPowermining ? 'Yes' : 'No',
			result.others.join(', '),
			result.itemsPerHour.toItemBankRoundedUp().toString().replace('No items', '')
		);
	}

	handleMarkdownEmbed('miningxphr', 'osb/Skills/mining.mdx', table.toString());
}

main();
