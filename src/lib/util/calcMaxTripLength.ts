import { activity_type_enum, User } from '@prisma/client';
import { calcPercentOfNum, calcWhatPercent, Time } from 'e';
import { KlasaUser } from 'klasa';

import { PerkTier } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import getUsersPerkTier, { patronMaxTripCalc } from './getUsersPerkTier';
import { skillLevel, userHasItemsEquippedAnywhere } from './minionUtils';

export function calcMaxTripLength(user: User | KlasaUser, activity?: activity_type_enum) {
	let max = Time.Minute * 30;

	max += patronMaxTripCalc(this);

	const hasMasterHPCape = this.hasItemEquippedAnywhere('Hitpoints master cape');
	let masterHPCapeBoost = 0;
	let regularHPBoost = false;

	switch (activity) {
		case 'Fishing':
			if (this.hasItemEquippedAnywhere('Fish sack')) {
				max += Time.Minute * 9;
			}
			break;
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
			masterHPCapeBoost = 20;
			regularHPBoost = true;
			break;
		}
		case 'KalphiteKing':
		case 'Nex':
		case 'VasaMagus':
		case 'Naxxus':
		case 'Ignecarus':
		case 'KingGoldemar':
		case 'Dungeoneering': {
			masterHPCapeBoost = 10;
			regularHPBoost = true;
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

	if (regularHPBoost) {
		const hpLevel = this.skillLevel(SkillsEnum.Hitpoints);
		const hpPercent = calcWhatPercent(hpLevel - 10, 99 - 10);
		max += calcPercentOfNum(hpPercent, Time.Minute * 5);

		if (hasMasterHPCape) {
			max += calcPercentOfNum(masterHPCapeBoost, max);
		}
	}

	if (this.usingPet('Zak')) {
		max *= 1.4;
	}

	const sac = this.settings.get(UserSettings.SacrificedValue);
	const sacPercent = Math.min(100, calcWhatPercent(sac, this.isIronman ? 5_000_000_000 : 10_000_000_000));
	max += calcPercentOfNum(sacPercent, this.perkTier >= PerkTier.Four ? Time.Minute * 3 : Time.Minute);
	return max;
}
