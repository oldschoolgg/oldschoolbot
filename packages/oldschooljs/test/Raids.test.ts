import { expect, test } from 'vitest';

import { ChambersOfXeric, CoXCMUniqueTable, CoXUniqueTable } from '@/simulation/misc/ChambersOfXeric.js';
import { Items } from '@/structures/Items.js';

function getTableItemWeight(table: typeof CoXUniqueTable, itemName: string): number {
	const item = table.table.find(entry => entry.item === Items.getId(itemName));
	if (!item?.weight) throw new Error(`${itemName} not found in CoX table`);
	return item.weight;
}

test('Chambers Of Xeric', async () => {
	expect.assertions(3);

	const maxRoll = 570_000 * (1 / 8675);

	expect(ChambersOfXeric.determineUniqueChancesFromTeamPoints(570_000)).toEqual([maxRoll]);

	expect(ChambersOfXeric.determineUniqueChancesFromTeamPoints(855_000)).toEqual([
		maxRoll,
		855_000 * (1 / 8675) - maxRoll
	]);

	expect(ChambersOfXeric.determineUniqueChancesFromTeamPoints(73_000_000)).toEqual([maxRoll, maxRoll, maxRoll]);
});

test('Chambers Of Xeric unique table weights', () => {
	expect(CoXUniqueTable.totalWeight).toBe(60);
	expect(getTableItemWeight(CoXUniqueTable, 'Dexterous prayer scroll')).toBe(14);
	expect(getTableItemWeight(CoXUniqueTable, 'Arcane prayer scroll')).toBe(14);

	expect(CoXCMUniqueTable.totalWeight).toBe(56);
	expect(getTableItemWeight(CoXCMUniqueTable, 'Dexterous prayer scroll')).toBe(12);
	expect(getTableItemWeight(CoXCMUniqueTable, 'Arcane prayer scroll')).toBe(12);
});
