import type { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { getUserGear } from '../../mahoji/mahojiSettings';
import { allPetIDs } from '../data/CollectionsExport';
import { getSimilarItems } from '../data/similarItems';
import { UserSettings } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import { convertXPtoLVL } from '../util';
import resolveItems from './resolveItems';

export function skillLevel(user: KlasaUser | User, skill: SkillsEnum) {
	const xp =
		user instanceof KlasaUser ? (user.settings.get(`skills.${skill}`) as number) : Number(user[`skills_${skill}`]);
	return convertXPtoLVL(xp);
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

export function hasItemsEquippedOrInBank(
	user: User | KlasaUser,
	_items: (string | number)[],
	type: 'every' | 'one' = 'one'
): boolean {
	const bank = user instanceof KlasaUser ? user.bank() : new Bank(user.bank as ItemBank);
	const items = resolveItems(_items);
	for (const baseID of items) {
		const similarItems = [...getSimilarItems(baseID), baseID];
		const hasOneEquipped = similarItems.some(id => userHasItemsEquippedAnywhere(user, id, true));
		const hasOneInBank = similarItems.some(id => bank.has(id));
		// If only one needs to be equipped, return true now if it is equipped.
		if (type === 'one' && (hasOneEquipped || hasOneInBank)) return true;
		// If all need to be equipped, return false now if not equipped.
		else if (type === 'every' && !hasOneEquipped && !hasOneInBank) {
			return false;
		}
	}
	return type === 'one' ? false : true;
}
