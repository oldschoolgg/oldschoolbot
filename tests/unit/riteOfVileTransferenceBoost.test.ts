import { Time } from '@oldschoolgg/toolkit';
import { Bank, EMonster, Monsters } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { BitField } from '../../src/lib/constants.js';
import type { PostBoostEffect } from '../../src/mahoji/lib/abstracted_commands/minionKill/postBoostEffects.js';
import { type Boost, mainBoostEffects } from '../../src/mahoji/lib/abstracted_commands/minionKill/speedBoosts.js';
import { makeGearBank } from './utils.js';

function getRiteBoostEffect(): Boost {
	const effect = mainBoostEffects.find(e => !Array.isArray(e) && e.description === 'Rite of vile transference boost');

	if (!effect || Array.isArray(effect)) {
		throw new Error('Missing Rite of vile transference boost effect');
	}
	return effect;
}

const riteBoostEffect = getRiteBoostEffect();

function deathChargeRuneBank(casts: number) {
	return new Bank().add('Death rune', casts).add('Blood rune', casts).add('Soul rune', casts);
}

function resultItemCostString(result: unknown) {
	if (typeof result !== 'object' || result === null || Array.isArray(result) || !('itemCost' in result)) {
		return undefined;
	}
	return (result as { itemCost?: Bank }).itemCost?.toString();
}

function runRiteBoost({
	bank = deathChargeRuneBank(1000),
	bitfield = [BitField.HasRiteOfVileTransference],
	duration = 10 * Time.Minute,
	magicLevel = 99,
	monsterID,
	quantity = 10
}: {
	bank?: Bank;
	bitfield?: BitField[];
	duration?: number;
	magicLevel?: number;
	monsterID: number;
	quantity?: number;
}) {
	const postBoostEffects: PostBoostEffect[] = [];
	const gearBank = makeGearBank({
		bank,
		skillsAsLevels: {
			magic: magicLevel
		}
	});
	const result = riteBoostEffect.run({
		monster: { id: monsterID, name: 'Monster' },
		bitfield,
		gearBank,
		addPostBoostEffect: (effect: PostBoostEffect) => {
			postBoostEffects.push(effect);
		}
	} as any);
	const postBoostEffect = postBoostEffects[0];

	return {
		result,
		postBoostResult: postBoostEffect
			? postBoostEffect.run({
					duration,
					quantity,
					gearBank
				} as any)
			: undefined
	};
}

describe('Rite of vile transference boost', () => {
	it('applies the configured boost percentages', () => {
		const expectedBoosts: [number, number][] = [
			[Monsters.Yama.id, 5],
			[Monsters.Scurrius.id, 5],
			[Monsters.Amoxliatl.id, 3],
			[Monsters.Branda.id, 5],
			[Monsters.Eldric.id, 5],
			[Monsters.RoyalTitans.id, 5],
			[EMonster.NIGHTMARE, 5],
			[EMonster.PHOSANI_NIGHTMARE, 5],
			[Monsters.GrotesqueGuardians.id, 5],
			[Monsters.Cerberus.id, 5],
			[Monsters.Araxxor.id, 7],
			[Monsters.Hydra.id, 3],
			[Monsters.AlchemicalHydra.id, 3]
		];

		for (const [monsterID, expectedBoost] of expectedBoosts) {
			const { result, postBoostResult } = runRiteBoost({ monsterID });
			expect(result).toBeNull();
			expect(postBoostResult).toMatchObject({
				percentageReduction: expectedBoost,
				message: `${expectedBoost}% for Rite of vile transference (10 Death Charge casts)`
			});
			expect(resultItemCostString(postBoostResult)).toBe(deathChargeRuneBank(10).toString());
		}
	});

	it('does not apply without the rite bitfield', () => {
		expect(runRiteBoost({ monsterID: Monsters.Yama.id, bitfield: [] }).postBoostResult).toBeUndefined();
	});

	it('does not apply to unrelated monsters', () => {
		expect(runRiteBoost({ monsterID: Monsters.Zulrah.id }).postBoostResult).toBeUndefined();
	});

	it('does not apply when disabled in user config', () => {
		expect(
			runRiteBoost({
				monsterID: Monsters.Yama.id,
				bitfield: [BitField.HasRiteOfVileTransference, BitField.DisableRiteOfVileTransference]
			}).postBoostResult
		).toBeUndefined();
	});

	it('requires 80 Magic to apply', () => {
		expect(runRiteBoost({ monsterID: Monsters.Yama.id, magicLevel: 79 }).postBoostResult).toBeUndefined();
		expect(runRiteBoost({ monsterID: Monsters.Yama.id, magicLevel: 80 }).postBoostResult).toBeDefined();
	});

	it('caps casts by the 60 second cooldown and available runes', () => {
		const { postBoostResult } = runRiteBoost({
			monsterID: Monsters.Yama.id,
			duration: 5.5 * Time.Minute,
			quantity: 10,
			bank: deathChargeRuneBank(4)
		});

		expect(postBoostResult).toMatchObject({
			percentageReduction: 2,
			message: '2% for Rite of vile transference (4 Death Charge casts)'
		});
		expect(resultItemCostString(postBoostResult)).toBe(deathChargeRuneBank(4).toString());
	});
});
