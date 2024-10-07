import { writeFileSync } from 'node:fs';
import { calcPerHour } from '@oldschoolgg/toolkit';
import { Time } from 'e';
import { itemID } from 'oldschooljs/dist/util';
import { test } from 'vitest';

import { groupBy } from 'remeda';
import { ClueTiers } from '../../../src/lib/clues/clueTiers';
import { determineTameClueResult } from '../../../src/mahoji/commands/tames';

test('Tame Clues', () => {
	const rawResults = [];
	for (const tameLevel of [50, 60, 70, 75, 80, 85, 90, 95, 100]) {
		for (const clueTier of ClueTiers) {
			const res = determineTameClueResult({
				tameGrowthLevel: 3,
				clueTier,
				extraTripLength: Time.Hour * 10,
				supportLevel: tameLevel,
				equippedArmor: itemID('Abyssal jibwings (e)'),
				equippedPrimary: itemID('Divine ring')
			});

			rawResults.push({
				...res,
				tameLevel,
				clueTier,
				cluesPerHour: calcPerHour(res.quantity, res.duration),
				kibblePerHour: calcPerHour(res.cost.amount('Extraordinary kibble'), res.duration),
				gmcPerHour: calcPerHour(res.cost.amount('Clue scroll (grandmaster)'), res.duration)
			});
		}
	}

	const grouped = groupBy(rawResults, i => i.clueTier.name);
	const groupedResults = Object.entries(grouped).map(group => {
		const [clueTier, results] = group;
		return { tier: clueTier, sorted: results.sort((a, b) => b.cluesPerHour - a.cluesPerHour) };
	});

	let results = `${['Support Level', 'Clue Tier', 'Clues/hr', 'Kibble/hr', 'GMC/Hr'].join('\t')}\n`;
	for (const { tier, sorted } of groupedResults) {
		for (const res of sorted) {
			results += [
				res.tameLevel,
				res.clueTier.name,
				`${res.cluesPerHour.toFixed(2)} ${tier}/hr`,
				`${res.kibblePerHour.toFixed(2)} kibble/hr`,
				res.gmcPerHour > 0 ? `${res.gmcPerHour.toFixed(2)} GMC/hr` : ''
			].join('\t');
			results += '\n';
		}
	}

	writeFileSync('./tests/unit/snapshots/tame_clues.tsv', results);
});
