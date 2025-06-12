import { Table, calcPerHour } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { type Bank, convertLVLtoXP } from 'oldschooljs/dist/meta/types';
import { uniqueBy } from 'remeda';

import '../../src/lib/safeglobals.js';

import { ClueTiers } from '../../src/lib/clues/clueTiers.js';
import Mining from '../../src/lib/skilling/skills/mining.js';
import type { Ore } from '../../src/lib/skilling/types.js';
import { FloatBank } from '../../src/lib/structures/Bank.js';
import { determineMiningTrip } from '../../src/mahoji/commands/mine.js';
import { determineMiningResult } from '../../src/tasks/minions/miningActivity.js';
import { makeGearBank } from '../../tests/unit/utils.js';
import { handleMarkdownEmbed } from '../wiki.js';

function bankToPerHour(bank: Bank, duration: number): FloatBank {
	const perHourBank = new FloatBank();
	for (const [item, qty] of bank.items()) {
		perHourBank.add(item.id, qty / (duration / Time.Hour));
	}
	return perHourBank;
}

export function miningSnapshots() {
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

						const tripLengthHours = 2000;

						const trip = determineMiningTrip({
							gearBank,
							ore,
							maxTripLength: Time.Hour * tripLengthHours,
							isPowermining,
							quantityInput: undefined,
							hasKaramjaMedium,
							randomVariationEnabled: false
						});
						const result = determineMiningResult({
							ore,
							quantity: trip.quantity,
							gearBank,
							duration: trip.duration,
							isPowermining,
							hasFinishedCOTS
						});
						result.updateBank.itemLootBank.remove('Rock golem', 1000);
						result.updateBank.itemLootBank.remove('Loop half of key (moon key)', 1000);

						for (const clueTier of ClueTiers) {
							result.updateBank.itemLootBank.remove(
								clueTier.scrollID,
								result.updateBank.itemLootBank.amount(clueTier.scrollID)
							);
						}

						const xp = result.updateBank.xpBank.amount('mining');
						let xpHr = calcPerHour(xp, trip.duration);
						// Round down to nearest 1000
						xpHr = Math.floor(xpHr / 1000) * 1000;

						results.push({
							xpHr,
							ore,
							isPowermining,
							others,
							level,
							itemsPerHour: bankToPerHour(result.updateBank.itemLootBank, trip.duration)
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
