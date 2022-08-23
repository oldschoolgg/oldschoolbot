import { activity_type_enum } from '@prisma/client';
import { calcPercentOfNum, calcWhatPercent, Time } from 'e';

import { PerkTier } from '../constants';
import { MUser } from '../MUser';
import { SkillsEnum } from '../skilling/types';
import getUsersPerkTier, { patronMaxTripCalc } from './getUsersPerkTier';
import { skillLevel } from './minionUtils';

export function calcMaxTripLength(user: MUser, activity?: activity_type_enum) {
	let max = Time.Minute * 30;

	max += patronMaxTripCalc(user);

	switch (activity) {
		case 'Nightmare':
		case 'GroupMonsterKilling':
		case 'MonsterKilling':
		case 'Wintertodt':
		case 'Zalcano':
		case 'BarbarianAssault':
		case 'AnimatedArmour':
		case 'Sepulchre':
		case 'Pickpocket':
		case 'SoulWars':
		case 'Cyclops': {
			const hpLevel = skillLevel(user, SkillsEnum.Hitpoints);
			const hpPercent = calcWhatPercent(hpLevel - 10, 99 - 10);
			max += calcPercentOfNum(hpPercent, Time.Minute * 5);
			break;
		}
		case 'Alching': {
			max *= 2;
			break;
		}
		default: {
			break;
		}
	}

	const sac = Number(user.user.sacrificedValue);
	const { isIronman } = user;
	const sacPercent = Math.min(100, calcWhatPercent(sac, isIronman ? 5_000_000_000 : 10_000_000_000));
	const perkTier = getUsersPerkTier(user);
	max += calcPercentOfNum(sacPercent, perkTier >= PerkTier.Four ? Time.Minute * 3 : Time.Minute);
	return max;
}
