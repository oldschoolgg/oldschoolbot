import ava from 'ava';

import { gearSetupMeetsRequirement } from '../src/lib/minions/functions/gearSetupMeetsRequirement';

const mockRequirements = {
	attack_stab: 100,
	attack_slash: 100,
	attack_crush: 100,
	attack_magic: 100,
	attack_ranged: 100,
	defence_stab: 100,
	defence_slash: 100,
	defence_crush: 100,
	defence_magic: 100,
	defence_ranged: 100,
	melee_strength: 100,
	ranged_strength: 100,
	magic_damage: 100,
	prayer: 100
};

ava('equal stats and requirements', test => {
	const [meetsRequirements, unmetKey, has] = gearSetupMeetsRequirement(
		mockRequirements,
		mockRequirements
	);
	test.is(meetsRequirements, true);
	test.is(unmetKey, null);
	test.is(has, null);
});

ava('insufficient stats', test => {
	const [meetsRequirements, unmetKey, has] = gearSetupMeetsRequirement(
		{ ...mockRequirements, prayer: 0 },
		mockRequirements
	);
	test.is(meetsRequirements, false);
	test.is(unmetKey, 'prayer');
	test.is(has, 0);
});
