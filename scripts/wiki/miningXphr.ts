import { calcPerHour } from '@oldschoolgg/toolkit';
import { Time } from 'e';

import Mining from '../../src/lib/skilling/skills/mining';
import type { Ore } from '../../src/lib/skilling/types';
import { determineMiningTrip } from '../../src/mahoji/commands/mine';
import { determineMiningResult } from '../../src/tasks/minions/miningActivity';
import { makeGearBank } from '../../tests/unit/utils';
import { Table } from '../markdown/markdown';
import { handleMarkdownEmbed } from '../wiki';

export function miningXpHr() {
	const gearBank = makeGearBank();
	gearBank.skillsAsLevels.mining = 99;
	gearBank.skillsAsXP.mining = 13_500_000;
	gearBank.gear.skilling.equip('Varrock armour 4');
	gearBank.gear.skilling.equip('Expert mining gloves');
	gearBank.gear.skilling.equip('Crystal pickaxe');
	gearBank.skillsAsLevels.crafting = 99;

	const results: { xpHr: number; ore: Ore; isPowermining: boolean }[] = [];
	for (const ore of Mining.Ores) {
		for (const isPowermining of [true, false]) {
			const trip = determineMiningTrip({
				gearBank,
				ore,
				maxTripLength: Time.Hour * 1000,
				isPowermining,
				quantityInput: undefined
			});
			const result = determineMiningResult({
				ore,
				quantity: trip.quantity,
				gearBank,
				duration: trip.duration,
				isPowermining
			});
			const xp = result.updateBank.xpBank.amount('mining');
			const xpHr = Math.floor(calcPerHour(xp, trip.duration) / 1000) * 1000;
			results.push({ xpHr, ore, isPowermining });
		}
	}

	results.sort((a, b) => a.ore.name.localeCompare(b.ore.name));
	results.sort((a, b) => b.xpHr - a.xpHr);

	const table = new Table();
	table.addHeader('Ore', 'XP/hr', 'Powermining');
	for (const result of results) {
		table.addRow(`[[${result.ore.id}]]`, result.xpHr.toLocaleString(), result.isPowermining ? 'Yes' : 'No');
	}

	handleMarkdownEmbed('miningxphr', 'osb/Skills/mining.md', table.toString());
}
