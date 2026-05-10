import { calcPercentOfNum, calcWhatPercent, Time } from '@oldschoolgg/toolkit';

import type { activity_type_enum } from '@/prisma/main/enums.js';
import { PerkTier } from '@/lib/constants.js';

export function patronMaxTripBonus(perkTier: PerkTier | 0) {
	if (perkTier === PerkTier.Two) return Time.Minute * 3;
	else if (perkTier === PerkTier.Three) return Time.Minute * 6;
	else if (perkTier >= PerkTier.Four) return Time.Minute * 10;
	return 0;
}

export async function calcMaxTripLength(user: MUser, activity?: activity_type_enum) {
	const perkTier = await user.fetchPerkTier();
	let max = Time.Minute * 30;
	max += patronMaxTripBonus(perkTier);

	switch (activity) {
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
			const hpLevel = user.skillsAsLevels.hitpoints;
			const hpPercent = calcWhatPercent(hpLevel - 10, 99 - 10);
			max += calcPercentOfNum(hpPercent, Time.Minute * 5);
			break;
		}
		case 'Alching': {
			max *= 2;
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

	const sac = Number(user.user.sacrificedValue);
	const { isIronman } = user;
	const sacPercent = Math.min(100, calcWhatPercent(sac, isIronman ? 5_000_000_000 : 10_000_000_000));
	max += calcPercentOfNum(sacPercent, perkTier >= PerkTier.Four ? Time.Minute * 3 : Time.Minute);
	return max;
}
