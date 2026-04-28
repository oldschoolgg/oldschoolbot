import { EMonster, Monsters } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { BitField } from '../../src/lib/constants.js';
import { type Boost, mainBoostEffects } from '../../src/mahoji/lib/abstracted_commands/minionKill/speedBoosts.js';

function getRiteBoostEffect(): Boost {
	const effect = mainBoostEffects.find(e => !Array.isArray(e) && e.description === 'Rite of vile transference boost');

	if (!effect || Array.isArray(effect)) {
		throw new Error('Missing Rite of vile transference boost effect');
	}
	return effect;
}

const riteBoostEffect = getRiteBoostEffect();

function runRiteBoost(monsterID: number, hasRite = true) {
	return riteBoostEffect.run({
		monster: { id: monsterID },
		bitfield: hasRite ? [BitField.HasRiteOfVileTransference] : []
	} as any);
}

describe('Rite of vile transference boost', () => {
	it('applies the configured boost percentages', () => {
		const expectedBoosts: [number, number][] = [
			[Monsters.Yama.id, 7],
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
			expect(runRiteBoost(monsterID)).toMatchObject({
				percentageReduction: expectedBoost,
				message: `${expectedBoost}% for Rite of vile transference`
			});
		}
	});

	it('does not apply without the rite bitfield', () => {
		expect(runRiteBoost(Monsters.Yama.id, false)).toBeNull();
	});

	it('does not apply to unrelated monsters', () => {
		expect(runRiteBoost(Monsters.Zulrah.id)).toBeNull();
	});
});
