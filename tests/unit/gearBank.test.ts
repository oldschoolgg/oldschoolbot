import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { Bank, EGear } from 'oldschooljs';
import { describe, expect, it, test } from 'vitest';

import { GearBank } from '@/lib/structures/GearBank.js';
import { defaultSkillsAsXPObj, makeGearBank } from './utils.js';

describe('GearBank', () => {
	it('should calculate combat level', () => {
		const gb1 = makeGearBank({
			skillsAsLevels: {
				attack: 55,
				strength: 13,
				defence: 12,
				hitpoints: 10
			}
		});
		expect(gb1.combatLevel).toBe(27);
	});

	it('should check skill reqs', () => {
		const gb1 = makeGearBank({
			skillsAsLevels: {
				attack: 55,
				strength: 13,
				defence: 12,
				hitpoints: 10
			}
		});
		expect(gb1.hasSkillReqs({ attack: 55 })).toBe(true);
		expect(gb1.hasSkillReqs({ attack: 55, strength: 13 })).toBe(true);
		expect(gb1.hasSkillReqs({ attack: 55, strength: 13, defence: 12 })).toBe(true);
		expect(gb1.hasSkillReqs({ attack: 55, strength: 13, defence: 12, hitpoints: 10 })).toBe(true);
		expect(gb1.hasSkillReqs({ attack: 55, strength: 13, defence: 12, hitpoints: 10, construction: 2 })).toBe(false);
		expect(gb1.hasSkillReqs({ attack: 55, strength: 14 })).toBe(false);
		expect(gb1.hasSkillReqs({ farming: 2 })).toBe(false);

		expect(gb1.hasSkillReqs({ combat: 5 })).toBe(true);
		expect(gb1.hasSkillReqs({ combat: 10 })).toBe(true);
		expect(gb1.hasSkillReqs({ combat: 100 })).toBe(false);
	});

	it('should have correct stats', () => {
		const gb1 = new GearBank({
			gear: {} as any,
			bank: new Bank(),
			chargeBank: new Bank() as any,
			skillsAsXP: {
				...defaultSkillsAsXPObj,
				attack: 13034431,
				defence: 150_000_000
			},
			minionName: 'Minion',
			pet: null,
			materials: new MaterialBank()
		});
		expect(gb1.skillsAsLevels.attack).toBe(99);
		expect(gb1.skillsAsXP.attack).toBe(13034431);
		expect(gb1.skillsAsLevels.strength).toBe(1);
		expect(gb1.skillsAsLevels.defence).toBe(120);
		expect(gb1.skillsAsXP.defence).toBe(150_000_000);
	});

	test('wildyGearCheck', () => {
		const gb1 = makeGearBank();
		expect(gb1.wildyGearCheck(EGear.ABYSSAL_WHIP, true)).toBe(false);
		gb1.gear.melee.equip(EGear.ABYSSAL_WHIP);
		expect(gb1.wildyGearCheck(EGear.ABYSSAL_WHIP, true)).toBe(false);
		expect(gb1.wildyGearCheck(EGear.ABYSSAL_WHIP, false)).toBe(true);

		gb1.gear.wildy.equip(EGear.ABYSSAL_WHIP);
		expect(gb1.wildyGearCheck(EGear.ABYSSAL_WHIP, true)).toBe(true);
	});
});
