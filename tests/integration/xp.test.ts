import { describe, expect, test } from 'vitest';

import { SkillsEnum } from '../../src/lib/skilling/types';
import { createTestUser, mockClient } from './util';

describe('XP', async () => {
	await mockClient();

	test('', async () => {
		const user = await createTestUser();
		expect(user.getSkills(true).attack).toEqual(1);
		expect(user.skillsAsLevels.attack).toEqual(1);
		expect(user.skillsAsXP.attack).toEqual(0);
		expect(user.getSkills(false).attack).toEqual(0);
		await user.addXP({ skillName: SkillsEnum.Attack, amount: 100 });
		expect(user.getSkills(true).attack).toEqual(2);
		expect(user.skillsAsLevels.attack).toEqual(2);
		expect(user.skillsAsXP.attack).toEqual(100);
		expect(user.getSkills(false).attack).toEqual(100);

		await user.addXP({ skillName: SkillsEnum.Attack, amount: 80 });
		expect(user.getSkills(true).attack).toEqual(3);
		expect(user.skillsAsLevels.attack).toEqual(3);
		expect(user.skillsAsXP.attack).toEqual(180);
		expect(user.getSkills(false).attack).toEqual(180);

		await user.sync();
		expect(user.getSkills(true).attack).toEqual(3);
		expect(user.skillsAsLevels.attack).toEqual(3);
		expect(user.skillsAsXP.attack).toEqual(180);
		expect(user.getSkills(false).attack).toEqual(180);
	});
});
