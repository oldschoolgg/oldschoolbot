import { Time } from 'e';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { GearStat } from '../../gear';

export const EasyEncounterLoot = new LootTable().add('Riyl remains', 3).add('Nail beast nails', [2, 3]);

export const MediumEncounterLoot = new LootTable().add('Asyn remains', 4).add('Nail beast nails', [3, 4]);

export const HardEncounterLoot = new LootTable().add('Fiyr remains', 5).add('Nail beast nails', [4, 6]);

export const difficulties = [
	{
		difficulty: 'easy',
		minCombat: 45,
		minimumGearRequirements: {
			[GearStat.DefenceStab]: 30
		},
		gearBoostThreshold: {
			[GearStat.DefenceStab]: 200
		},
		time: Time.Minute * 5,
		boosts: {
			ivandis: 1.1,
			gearStats: 1
		}
	},
	{
		// TODO: Balance stat requirements
		difficulty: 'medium',
		minCombat: 70,
		minimumGearRequirements: {
			[GearStat.DefenceStab]: 100
		},
		gearBoostThreshold: {
			[GearStat.DefenceStab]: 200
		},
		time: Time.Minute * 15,
		boosts: {
			ivandis: 1.2,
			gearStats: 0.667
		}
	},
	{
		difficulty: 'hard',
		minCombat: 110,
		minimumGearRequirements: {
			[GearStat.DefenceStab]: 150
		},
		gearBoostThreshold: {
			[GearStat.DefenceStab]: 300
		},
		time: Time.Minute * 30,
		boosts: {
			ivandis: 1.3,
			gearStats: 0.5
		}
	}
];

export const trekBankBoosts = resolveNameBank({
	'Salve amulet (e)': 5
});

export const ivandisRequirements = {
	attack: 40,
	strength: 40,
	agility: 45,
	crafting: 48,
	construction: 5,
	mining: 20,
	magic: 33,
	herblore: 40,
	slayer: 38,
	thieving: 22
};

export const rewardTokens = {
	easy: 7776,
	medium: 7774,
	hard: 7775
};
