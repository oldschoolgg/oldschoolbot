import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import type { KillableMonster } from '@/lib/minions/types.js';
import { Gear } from '@/lib/structures/Gear.js';
import { GearBank } from '@/lib/structures/GearBank.js';
import type { PostBoostEffect } from '@/mahoji/lib/abstracted_commands/minionKill/postBoostEffects.js';
import { type BoostResult, cannonBoost } from '@/mahoji/lib/abstracted_commands/minionKill/speedBoosts.js';

const cannonParts = new Bank({
	'Cannon barrels': 1,
	'Cannon base': 1,
	'Cannon furnace': 1,
	'Cannon stand': 1
});

const cannonableMultiMonster = {
	canCannon: true,
	cannonMulti: true,
	id: 1,
	name: 'Test cannon monster'
} as KillableMonster;

const materials = new MaterialBank({
	heavy: 10_000,
	metallic: 10_000,
	strong: 10_000
});

function gearBankWith(bank: Bank) {
	return new GearBank({
		bank,
		chargeBank: {} as never,
		gear: {
			fashion: new Gear(),
			mage: new Gear(),
			melee: new Gear(),
			misc: new Gear(),
			other: new Gear(),
			range: new Gear(),
			skilling: new Gear(),
			wildy: new Gear()
		},
		materials,
		minionName: 'Test minion',
		pet: null,
		skillsAsXP: {
			attack: 13_034_431,
			defence: 13_034_431,
			hitpoints: 13_034_431,
			strength: 13_034_431
		} as never
	});
}

function runCannonBoost(bank: Bank) {
	const postBoostEffects: PostBoostEffect[] = [];
	const result = cannonBoost.run({
		addInvention: () => undefined,
		addPostBoostEffect: (effect: PostBoostEffect) => postBoostEffects.push(effect),
		combatMethods: ['cannon'],
		disabledInventions: [],
		gearBank: gearBankWith(bank.add('Cannonball', 10_000)),
		isInWilderness: false,
		isOnTask: false,
		monster: cannonableMultiMonster
	} as never);

	if (!result || typeof result === 'string' || Array.isArray(result)) {
		throw new Error(`Unexpected cannon boost result: ${String(result)}`);
	}

	return { postBoostEffects, result: result as BoostResult };
}

describe('Superior dwarf multicannon', () => {
	test('uses superior cannon speed, message and materials when owned', () => {
		const { postBoostEffects, result } = runCannonBoost(new Bank().add('Superior dwarf multicannon'));

		expect(result.percentageReduction).toBe(65);
		expect(result.message).toBe('65% for Superior dwarf multicannon in multi');
		expect(postBoostEffects).toHaveLength(1);

		const postBoostResult = postBoostEffects[0].run({
			disabledInventions: [],
			duration: Time.Minute * 24,
			gearBank: gearBankWith(new Bank().add('Superior dwarf multicannon'))
		} as never);
		if (!postBoostResult || typeof postBoostResult === 'string' || Array.isArray(postBoostResult)) {
			throw new Error(`Unexpected post boost result: ${String(postBoostResult)}`);
		}

		expect(postBoostResult.message?.startsWith('Using Superior dwarf multicannon (Removed ')).toBe(true);
		expect(postBoostResult.materialCost?.amount('strong')).toBeGreaterThan(0);
	});

	test('does not use superior cannon from materials alone', () => {
		const { postBoostEffects, result } = runCannonBoost(cannonParts.clone());

		expect(result.percentageReduction).toBe(55);
		expect(result.message).toBe('55% for Cannon in multi');
		expect(postBoostEffects).toHaveLength(0);
	});
});
