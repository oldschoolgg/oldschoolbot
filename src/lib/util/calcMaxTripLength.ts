import { activity_type_enum } from '@prisma/client';
import { calcPercentOfNum, calcWhatPercent, Time } from 'e';

import { BitField, PerkTier } from '../constants';
import { SkillsEnum } from '../skilling/types';
import { skillLevel } from './minionUtils';

export function patronMaxTripBonus(user: MUser) {
	const perkTier = user.perkTier();
	if (perkTier === PerkTier.Two) return Time.Minute * 3;
	else if (perkTier === PerkTier.Three) return Time.Minute * 6;
	else if (perkTier >= PerkTier.Four) return Time.Minute * 10;
	return 0;
}

export function calcMaxTripLength(user: MUser, activity?: activity_type_enum) {
	let max = Time.Minute * 30;
	max += patronMaxTripBonus(user);

	const hasMasterHPCape = user.hasEquipped('Hitpoints master cape');
	let masterHPCapeBoost = 0;
	let regularHPBoost = false;

	switch (activity) {
		case 'Fishing':
			if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
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
		case 'Raids':
		case 'TheatreOfBlood':
		case 'TombsOfAmascut':
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
		case 'Ignecarus':
		case 'KingGoldemar':
		case 'Moktang':
		case 'DepthsOfAtlantis':
		case 'Naxxus':
		case 'Dungeoneering': {
			masterHPCapeBoost = 10;
			regularHPBoost = true;
			break;
		}
		case 'Alching': {
			max *= 2;
			break;
		}
		case 'TinkeringWorkshop':
		case 'Disassembling':
		case 'Research': {
			if (user.hasEquippedOrInBank('Materials bag')) {
				max += Time.Minute * 7;
			}
			break;
		}
		case 'NightmareZone': {
			max *= 3;
			break;
		}
		default: {
			break;
		}
	}

	if (regularHPBoost) {
		const hpLevel = skillLevel(user, SkillsEnum.Hitpoints);
		const hpPercent = calcWhatPercent(hpLevel - 10, 99 - 10);
		max += calcPercentOfNum(hpPercent, Time.Minute * 5);

		if (hasMasterHPCape) {
			max += calcPercentOfNum(masterHPCapeBoost, max);
		}
	}

	if (user.usingPet('Zak')) {
		max *= 1.4;
	}

	const sac = Number(user.user.sacrificedValue);
	const { isIronman } = user;
	const sacPercent = Math.min(100, calcWhatPercent(sac, isIronman ? 5_000_000_000 : 10_000_000_000));
	const perkTier = user.perkTier();
	max += calcPercentOfNum(sacPercent, perkTier >= PerkTier.Four ? Time.Minute * 3 : Time.Minute);

	if (user.bitfield.includes(BitField.HasLeaguesOneMinuteLengthBoost)) {
		max += Time.Minute;
	}

	return max;
}
