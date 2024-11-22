import { expect, test } from 'vitest';

import { ChambersOfXeric } from '../src/simulation/misc';

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
