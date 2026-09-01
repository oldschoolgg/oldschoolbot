import { describe, expect, test } from 'vitest';

import { didAllTOAMembersDieInRoom, getSuccessfulTOARaidCount } from '@/lib/simulation/toaUtils.js';

describe('toaUtils', () => {
	test('getSuccessfulTOARaidCount uses only successful clears', () => {
		expect(getSuccessfulTOARaidCount({ quantity: 2, wipedRooms: [null, 3] })).toBe(1);
		expect(getSuccessfulTOARaidCount({ quantity: 5, wipedRooms: [null, null, null, null, null] })).toBe(5);
		expect(getSuccessfulTOARaidCount({ quantity: 3, wipedRooms: [1, 2, 5] })).toBe(0);
	});

	test('didAllTOAMembersDieInRoom checks real room IDs', () => {
		const team = [{ deaths: [1, 3] }, { deaths: [1] }, { deaths: [1, 4] }];
		expect(didAllTOAMembersDieInRoom(team, 1)).toBe(true);
		expect(didAllTOAMembersDieInRoom(team, 0)).toBe(false);
		expect(didAllTOAMembersDieInRoom(team, 2)).toBe(false);
	});
});
