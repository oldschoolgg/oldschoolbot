import { activity_type_enum, User } from '@prisma/client';
import { calcPercentOfNum, calcWhatPercent, Time } from 'e';
import { KlasaUser } from 'klasa';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { getUserGear } from '../../mahoji/mahojiSettings';
import { PerkTier } from '../constants';
import { allPetIDs } from '../data/CollectionsExport';
import { UserSettings } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import { convertXPtoLVL, patronMaxTripCalc } from '../util';
import getUsersPerkTier from './getUsersPerkTier';
import resolveItems from './resolveItems';

export function skillLevel(user: KlasaUser | User, skill: SkillsEnum) {
	const xp =
		user instanceof KlasaUser ? (user.settings.get(`skills.${skill}`) as number) : Number(user[`skills_${skill}`]);
	return convertXPtoLVL(xp);
}

export function calcMaxTripLength(user: User | KlasaUser, activity?: activity_type_enum) {
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

	const sac =
		user instanceof KlasaUser ? user.settings.get(UserSettings.SacrificedValue) : Number(user.sacrificedValue);
	const isIronman = user instanceof KlasaUser ? user.isIronman : user.minion_ironman;
	const sacPercent = Math.min(100, calcWhatPercent(sac, isIronman ? 5_000_000_000 : 10_000_000_000));
	const perkTier = getUsersPerkTier(user instanceof KlasaUser ? user : user.bitfield);
	max += calcPercentOfNum(sacPercent, perkTier >= PerkTier.Four ? Time.Minute * 3 : Time.Minute);
	return max;
}

export function getKC(user: KlasaUser | User, id: number) {
	const scores: Readonly<ItemBank> =
		user instanceof KlasaUser ? user.settings.get(UserSettings.MonsterScores) : (user.monsterScores as ItemBank);
	return scores[id] ?? 0;
}

export const bows = resolveItems([
	'Twisted bow',
	'Bow of faerdhinen (c)',
	'Bow of faerdhinen',
	'Crystal bow',
	'3rd age bow',
	'Dark bow',
	"Craw's bow",
	'Magic comp bow',
	'Magic longbow',
	'Magic shortbow (i)',
	'Magic shortbow',
	'Seercull',
	'Yew comp bow',
	'Yew longbow',
	'Yew shortbow',
	'Comp ogre bow',
	'Ogre bow',
	'Maple longbow',
	'Maple shortbow',
	'Willow comp bow',
	'Willow longbow',
	'Willow shortbow',
	'Oak longbow',
	'Oak shortbow'
]);

export const arrows = resolveItems([
	'Dragon arrow',
	'Amethyst arrow',
	'Rune arrow',
	'Adamant arrow',
	'Mithril arrow',
	'Steel arrow',
	'Iron arrow',
	'Bronze arrow'
]);

export const crossbows = resolveItems([
	'Bronze crossbow',
	'Iron crossbow',
	'Steel crossbow',
	'Mithril crossbow',
	'Adamant crossbow',
	'Rune crossbow',
	'Dragon crossbow',
	'Dragon hunter crossbow',
	'Armadyl crossbow',
	'Zaryte crossbow'
]);

export const bolts = resolveItems([
	'Ruby dragon bolts (e)',
	'Dragon bolts',
	'Runite bolts',
	'Adamant bolts',
	'Mithril bolts',
	'Steel bolts',
	'Iron bolts',
	'Bronze bolts'
]);

export function userHasItemsEquippedAnywhere(
	user: User | KlasaUser,
	_item: number | string | string[] | number[],
	every = false
): boolean {
	const items = resolveItems(_item);
	if (items.length === 1 && allPetIDs.includes(items[0])) {
		const pet =
			user instanceof KlasaUser ? user.settings.get(UserSettings.Minion.EquippedPet) : user.minion_equippedPet;
		return pet === items[0];
	}

	const allGear = Object.values(user instanceof KlasaUser ? user.rawGear() : getUserGear(user));
	for (const gear of allGear) {
		if (gear.hasEquipped(items, every)) {
			return true;
		}
	}
	return false;
}
