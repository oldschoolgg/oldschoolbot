import { convertXPtoLVL } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { createTestUser, mockClient } from './util.js';

describe('XP', async () => {
	await mockClient();

	test('', async () => {
		const user = await createTestUser();
		expect(user.getSkills(true).attack).toEqual(1);
		expect(user.skillsAsLevels.attack).toEqual(1);
		expect(user.skillsAsXP.attack).toEqual(0);
		expect(user.getSkills(false).attack).toEqual(0);

		{
			const expectedXP = 100 * 5;
			const expectedLvl = convertXPtoLVL(expectedXP);
			await user.addXP({ skillName: 'attack', amount: 100 });
			expect(user.getSkills(true).attack).toEqual(expectedLvl);
			expect(user.skillsAsLevels.attack).toEqual(expectedLvl);
			expect(user.skillsAsXP.attack).toEqual(expectedXP);
			expect(user.getSkills(false).attack).toEqual(expectedXP);
		}

		const expectedXP = 180 * 5;
		const expectedLvl = convertXPtoLVL(expectedXP);
		await user.addXP({ skillName: 'attack', amount: 80 });
		expect(user.getSkills(true).attack).toEqual(expectedLvl);
		expect(user.skillsAsLevels.attack).toEqual(expectedLvl);
		expect(user.skillsAsXP.attack).toEqual(expectedXP);
		expect(user.getSkills(false).attack).toEqual(expectedXP);

		await user.sync();

		expect(user.getSkills(true).attack).toEqual(expectedLvl);
		expect(user.skillsAsLevels.attack).toEqual(expectedLvl);
		expect(user.skillsAsXP.attack).toEqual(expectedXP);
		expect(user.getSkills(false).attack).toEqual(expectedXP);
	});
});
