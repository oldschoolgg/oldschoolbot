import { skillsMeetRequirements } from '../src/lib/util/skillsMeetRequirements';

describe('skillsMeetRequirements', () => {
	test('meets requirements', () => {
		expect(skillsMeetRequirements({ agility: 10 }, { agility: 10 })).toBeTruthy();
		expect(skillsMeetRequirements({ agility: 50 }, { agility: 10 })).toBeTruthy();
		expect(
			skillsMeetRequirements({ agility: 50, runecraft: 1 }, { agility: 50, runecraft: 1 })
		).toBeTruthy();
		expect(
			skillsMeetRequirements(
				{
					agility: 90,
					cooking: 91,
					crafting: 35,
					firemaking: 50,
					fishing: 81,
					fletching: 69,
					smithing: 91
				},
				{
					agility: 90,
					cooking: 91,
					crafting: 35,
					firemaking: 50,
					fishing: 81,
					fletching: 69,
					smithing: 91
				}
			)
		).toBeTruthy();
	});
	test('doesnt meet requirements', () => {
		expect(skillsMeetRequirements({ agility: 1 }, { agility: 10 })).toBeFalsy();
		expect(skillsMeetRequirements({ agility: 49 }, { agility: 50 })).toBeFalsy();
		expect(skillsMeetRequirements({ agility: 49, runecraft: 1 }, { agility: 50 })).toBeFalsy();
		expect(
			skillsMeetRequirements(
				{
					agility: 89,
					cooking: 91,
					crafting: 35,
					firemaking: 50,
					fishing: 81,
					fletching: 69,
					smithing: 91
				},
				{
					agility: 90,
					cooking: 91,
					crafting: 35,
					firemaking: 50,
					fishing: 81,
					fletching: 69,
					smithing: 91
				}
			)
		).toBeFalsy();
	});
});
