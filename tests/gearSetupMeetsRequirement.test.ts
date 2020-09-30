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

describe('gearSetupMeetsRequirement.test', () => {
	test('insufficient stats', () => {
		const [meetsRequirements, unmetKey, has] = gearSetupMeetsRequirement(
			{ ...mockRequirements, prayer: 0 },
			mockRequirements
		);
		expect(meetsRequirements).toEqual(false);
		expect(unmetKey).toEqual('prayer');
		expect(has).toEqual(0);
	});

	test('sufficient stats', () => {
		const [meetsRequirements, unmetKey, has] = gearSetupMeetsRequirement(
			{ ...mockRequirements, prayer: 101 },
			mockRequirements
		);
		expect(meetsRequirements).toEqual(true);
		expect(unmetKey).toEqual(null);
		expect(has).toEqual(null);
	});

	test('equal stats and requirements', () => {
		const [meetsRequirements, unmetKey, has] = gearSetupMeetsRequirement(
			mockRequirements,
			mockRequirements
		);
		expect(meetsRequirements).toEqual(true);
		expect(unmetKey).toEqual(null);
		expect(has).toEqual(null);
	});
});
