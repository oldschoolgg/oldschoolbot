import { objectEntries } from 'e';
import { describe, expect, test } from 'vitest';

import type { Skills } from '../../src/lib/skilling/skills';
import { convertLVLtoXP, skillsMeetRequirements } from '../../src/lib/util';

function convert(bank: Record<keyof typeof Skills, number>) {
	const newObj: Record<keyof typeof Skills, number> = {};
	for (const [key, val] of objectEntries(bank)) {
		newObj[key] = convertLVLtoXP(val);
	}
	return newObj;
}

describe('skillsMeetRequirements', () => {
	test('meets requirements', () => {
		expect(skillsMeetRequirements(convert({ agility: 10 }), { agility: 10 })).toBeTruthy();
		expect(skillsMeetRequirements(convert({ agility: 50 }), { agility: 10 })).toBeTruthy();
		expect(
			skillsMeetRequirements(convert({ agility: 50, runecraft: 1 }), {
				agility: 50,
				runecraft: 1
			})
		).toBeTruthy();
		expect(
			skillsMeetRequirements(
				convert({
					agility: 90,
					cooking: 91,
					crafting: 35,
					firemaking: 50,
					fishing: 81,
					fletching: 69,
					smithing: 91
				}),
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
		expect(skillsMeetRequirements(convert({ agility: 1 }), { agility: 10 })).toBeFalsy();
		expect(skillsMeetRequirements(convert({ agility: 49 }), { agility: 50 })).toBeFalsy();
		expect(skillsMeetRequirements(convert({ agility: 49, runecraft: 1 }), { agility: 50 })).toBeFalsy();
		expect(
			skillsMeetRequirements(
				convert({
					agility: 89,
					cooking: 91,
					crafting: 35,
					firemaking: 50,
					fishing: 81,
					fletching: 69,
					smithing: 91
				}),
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
