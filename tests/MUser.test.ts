import { convertLVLtoXP } from 'oldschooljs/dist/util';

import { mockMUser } from './utils';

describe('MUser.test', () => {
	test('hasSkillReqs', () => {
		const u = mockMUser({
			skills_agility: convertLVLtoXP(50)
		});

		expect(u.hasSkillReqs({ agility: 49 })).toEqual(true);
		expect(u.hasSkillReqs({ agility: 50 })).toEqual(true);
		expect(u.hasSkillReqs({ agility: 51 })).toEqual(false);
	});
});
