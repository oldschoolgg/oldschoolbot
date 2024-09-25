import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

import { GearStat } from '../../gear/types';
import type { Skills } from '../../types';
import type { GearRequirements } from '../types';

interface TrekDifficulty {
	difficulty: string;
	minCombat: number;
	minimumGearRequirements: GearRequirements;
	time: number;
	boosts: trekBoost;
}

interface trekBoost {
	ivandis: number;
	blisterwood: number;
}

export const EasyEncounterLoot = new LootTable().add('Riyl remains', 3).add('Nail beast nails', [2, 3]);

export const MediumEncounterLoot = new LootTable().add('Asyn remains', 4).add('Nail beast nails', [3, 4]);

export const HardEncounterLoot = new LootTable().add('Fiyr remains', 5).add('Nail beast nails', [4, 6]);

export const difficulties: TrekDifficulty[] = [
	{
		difficulty: 'easy',
		minCombat: 45,
		minimumGearRequirements: {
			melee: {
				[GearStat.AttackCrush]: 20,
				[GearStat.AttackStab]: 20,
				[GearStat.AttackSlash]: 20,
				[GearStat.DefenceStab]: 30,
				[GearStat.DefenceSlash]: 30,
				[GearStat.DefenceCrush]: 30
			}
		},
		time: Time.Minute * 3,
		boosts: {
			ivandis: 0.9,
			blisterwood: 0.95
		}
	},
	{
		difficulty: 'medium',
		minCombat: 70,
		minimumGearRequirements: {
			melee: {
				[GearStat.AttackCrush]: 30,
				[GearStat.AttackStab]: 30,
				[GearStat.AttackSlash]: 30,
				[GearStat.DefenceStab]: 80,
				[GearStat.DefenceSlash]: 80,
				[GearStat.DefenceCrush]: 80
			}
		},
		time: Time.Minute * 5,
		boosts: {
			ivandis: 0.9,
			blisterwood: 0.95
		}
	},
	{
		difficulty: 'hard',
		minCombat: 110,
		minimumGearRequirements: {
			melee: {
				[GearStat.AttackCrush]: 40,
				[GearStat.AttackStab]: 40,
				[GearStat.AttackSlash]: 40,
				[GearStat.DefenceStab]: 150,
				[GearStat.DefenceSlash]: 150,
				[GearStat.DefenceCrush]: 150
			}
		},
		time: Time.Minute * 7,
		boosts: {
			ivandis: 0.9,
			blisterwood: 0.95
		}
	}
];

export const trekBankBoosts = new Bank({
	'Salve amulet (e)': 5
});

export const ivandisRequirements: Skills = {
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

export const blisterwoodRequirements: Skills = {
	attack: 50,
	strength: 40,
	agility: 52,
	crafting: 56,
	construction: 5,
	mining: 20,
	magic: 49,
	herblore: 40,
	slayer: 50,
	thieving: 22,
	woodcutting: 62,
	fletching: 60
};

export const rewardTokens = {
	easy: 7776,
	medium: 7774,
	hard: 7775
};
