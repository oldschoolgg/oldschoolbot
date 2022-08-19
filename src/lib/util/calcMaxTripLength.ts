import { activity_type_enum, User } from '@prisma/client';
import { calcPercentOfNum, calcWhatPercent, Time } from 'e';
import { KlasaUser } from 'klasa';

import { BitField, PerkTier } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import getUsersPerkTier, { patronMaxTripCalc } from './getUsersPerkTier';
import { skillLevel, userHasItemsEquippedAnywhere } from './minionUtils';

export function calcMaxTripLength(user: User | KlasaUser, activity?: activity_type_enum) {
	let max = Time.Minute * 30;

	max += patronMaxTripCalc(user);

	const hasMasterHPCape = userHasItemsEquippedAnywhere(user, 'Hitpoints master cape');
	let masterHPCapeBoost = 0;
	let regularHPBoost = false;

	switch (activity) {
		case 'Fishing':
			if (userHasItemsEquippedAnywhere(user, 'Fish sack')) {
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
		case 'Ignecarus':
		case 'KingGoldemar':
		case 'Moktang':
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
		const hpLevel = skillLevel(user, SkillsEnum.Hitpoints);
		const hpPercent = calcWhatPercent(hpLevel - 10, 99 - 10);
		max += calcPercentOfNum(hpPercent, Time.Minute * 5);

		if (hasMasterHPCape) {
			max += calcPercentOfNum(masterHPCapeBoost, max);
		}
	}

	if (userHasItemsEquippedAnywhere(user, 'Zak')) {
		max *= 1.4;
	}

	const sac =
		user instanceof KlasaUser ? user.settings.get(UserSettings.SacrificedValue) : Number(user.sacrificedValue);
	const isIronman = user instanceof KlasaUser ? user.isIronman : user.minion_ironman;
	const sacPercent = Math.min(100, calcWhatPercent(sac, isIronman ? 5_000_000_000 : 10_000_000_000));
	const perkTier = getUsersPerkTier(user);
	max += calcPercentOfNum(sacPercent, perkTier >= PerkTier.Four ? Time.Minute * 3 : Time.Minute);

	const bitfield = user instanceof KlasaUser ? user.settings.get(UserSettings.BitField) : user.bitfield;
	if (bitfield.includes(BitField.HasLeaguesOneMinuteLengthBoost)) {
		max += Time.Minute;
	}

	return max;
}
