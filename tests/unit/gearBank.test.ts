import { Bank, EGear } from 'oldschooljs';
import { describe, expect, it, test } from 'vitest';

import type { UserFullGearSetup } from '@/lib/gear/types.js';
import { ChargeBank } from '@/lib/structures/Bank.js';
import { Gear } from '@/lib/structures/Gear.js';
import { GearBank } from '@/lib/structures/GearBank.js';
import { defaultSkillsAsXPObj, makeGearBank } from './utils.js';

function makeTestGear(): UserFullGearSetup {
	return {
		melee: new Gear(),
		mage: new Gear(),
		range: new Gear(),
		fashion: new Gear(),
		wildy: new Gear(),
		skilling: new Gear(),
		misc: new Gear(),
		other: new Gear()
	};
}

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
			minionName: 'Minion'
		});
		expect(gb1.skillsAsLevels.attack).toBe(99);
		expect(gb1.skillsAsXP.attack).toBe(13034431);
		expect(gb1.skillsAsLevels.strength).toBe(1);
		expect(gb1.skillsAsLevels.defence).toBe(99);
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

	test('shares Avernic treads (max) across primary combat setups', () => {
		const gear = makeTestGear();
		gear.range.equip('Avernic treads (max)');
		gear.melee.equip('Dragon boots');
		const gb = new GearBank({
			gear,
			bank: new Bank(),
			chargeBank: new ChargeBank(),
			skillsAsXP: defaultSkillsAsXPObj,
			minionName: 'Minion'
		});

		expect(gb.gear.melee.hasEquipped('Avernic treads (max)', false, false)).toBe(true);
		expect(gb.gear.mage.hasEquipped('Avernic treads (max)', false, false)).toBe(true);
		expect(gb.gear.range.hasEquipped('Avernic treads (max)', false, false)).toBe(true);
		expect(gb.gear.skilling.hasEquipped('Avernic treads (max)', false, false)).toBe(false);
		expect(gb.gear.melee.hasEquipped('Dragon boots', false, false)).toBe(true);
		expect(gb.gear.melee.allItemsBank().equals(new Bank().add('Dragon boots'))).toBe(true);
		expect(gb.gear.mage.allItemsBank().equals(new Bank())).toBe(true);
		expect(gb.gear.range.allItemsBank().equals(new Bank().add('Avernic treads (max)'))).toBe(true);
		expect(gb.gear.melee.stats.melee_strength).toBeGreaterThan(0);
		expect(gb.gear.mage.stats.attack_magic).toBeGreaterThan(0);
	});
});
