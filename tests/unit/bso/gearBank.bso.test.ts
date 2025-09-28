import { describe, expect, test } from 'vitest';

import { makeGearBank } from '../utils.js';

describe('GearBank BSO', () => {
	test('Combat level', () => {
		const gb1 = makeGearBank({
			skillsAsLevels: {
				attack: 120,
				strength: 120,
				defence: 120,
				hitpoints: 120,
				ranged: 120,
				magic: 120,
				prayer: 120
			}
		});
		expect(gb1.combatLevel).toBe(126);

		const gb2 = makeGearBank({
			skillsAsLevels: {
				attack: 99,
				strength: 99,
				defence: 99,
				hitpoints: 99,
				ranged: 99,
				magic: 99,
				prayer: 99
			}
		});
		expect(gb2.combatLevel).toBe(126);
	});
});
