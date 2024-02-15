import { Tame, tame_growth, TameActivity, User } from '@prisma/client';
import { round } from 'e';
import { Items } from 'oldschooljs';

import { mahojiUsersSettingsFetch } from '../../mahoji/mahojiSettings';
import { ClueTiers } from '../clues/clueTiers';
import { getSimilarItems } from '../data/similarItems';
import { prisma } from '../settings/prisma';
import { seaMonkeySpells, Species, tameKillableMonsters, tameSpecies, TameTaskOptions, TameType } from '../tames';
import { ItemBank } from '../types';
import { itemNameFromID } from './smallUtils';

export async function tameLastFinishedActivity(user: MUser) {
	const tameID = user.user.selected_tame;
	if (!tameID) return null;
	return prisma.tameActivity.findFirst({
		where: {
			user_id: user.id,
			tame_id: tameID
		},
		orderBy: {
			start_date: 'desc'
		}
	});
}

export function shortTameTripDesc(activity: TameActivity) {
	const data = activity.data as unknown as TameTaskOptions;
	switch (data.type) {
		case TameType.Combat: {
			const mon = tameKillableMonsters.find(i => i.id === data.monsterID);
			return `Killing ${mon!.name}`;
		}
		case TameType.Gatherer: {
			return `Collecting ${itemNameFromID(data.itemID)}`;
		}
		case 'SpellCasting':
			return `Casting ${seaMonkeySpells.find(i => i.id === data.spellID)!.name}`;
		case 'Wintertodt': {
			return 'Fighting Wintertodt';
		}
		case 'Tempoross': {
			return 'Fighting Tempoross';
		}
		case 'Clues': {
			return `Completing ${ClueTiers.find(i => i.scrollID === data.clueID)!.name} clues`;
		}
	}
}

export function calculateMaximumTameFeedingLevelGain(tame: Tame) {
	const mainLevel = getMainTameLevel(tame);
	if (mainLevel >= 100) return 0;
	const difference = 100 - mainLevel;
	return Math.floor(difference / 2) - 1;
}

export function tameName(tame: Tame) {
	return `${tame.nickname ?? getTameSpecies(tame).name}`;
}

export function tameToString(tame: Tame) {
	let str = `${tameName(tame)} (`;
	str += [
		[tameGetLevel(tame, 'combat'), '<:combat:802136963956080650>'],
		[tameGetLevel(tame, 'artisan'), '<:artisan:802136963611885569>'],
		[tameGetLevel(tame, 'gatherer'), '<:gathering:802136963913613372>']
	]
		.map(([emoji, lvl]) => `${emoji}${lvl}`)
		.join(' ');
	str += ')';
	return str;
}

export function tameHasBeenFed(tame: Tame, item: string | number) {
	const { id } = Items.get(item)!;
	const items = getSimilarItems(id);
	return items.some(i => Boolean((tame.fed_items as ItemBank)[i]));
}

export function tameGrowthLevel(tame: Tame) {
	const growth = 3 - [tame_growth.baby, tame_growth.juvenile, tame_growth.adult].indexOf(tame.growth_stage);
	return growth;
}

export function getTameSpecies(tame: Tame) {
	return tameSpecies.find(s => s.id === tame.species_id)!;
}

export function getMainTameLevel(tame: Tame) {
	return tameGetLevel(tame, getTameSpecies(tame).relevantLevelCategory);
}

export function tameGetLevel(tame: Tame, type: 'combat' | 'gatherer' | 'support' | 'artisan') {
	const growth = tameGrowthLevel(tame);
	switch (type) {
		case 'combat':
			return round(tame.max_combat_level / growth, 2);
		case 'gatherer':
			return round(tame.max_gatherer_level / growth, 2);
		case 'support':
			return round(tame.max_support_level / growth, 2);
		case 'artisan':
			return round(tame.max_artisan_level / growth, 2);
	}
}

export async function getUsersTame(
	user: MUser | User | string
): Promise<
	{ tame: null; activity: null; species: null } | { tame: Tame; species: Species; activity: TameActivity | null }
> {
	const userID = typeof user === 'string' ? user : user.id;
	const selectedTame = (
		await mahojiUsersSettingsFetch(userID, {
			selected_tame: true
		})
	).selected_tame;
	if (!selectedTame) {
		return {
			tame: null,
			activity: null,
			species: null
		};
	}
	const tame = await prisma.tame.findFirst({ where: { id: selectedTame } });
	if (!tame) {
		throw new Error('No tame found for selected tame.');
	}
	const activity = await prisma.tameActivity.findFirst({
		where: { user_id: userID, tame_id: tame.id, completed: false }
	});
	const species = tameSpecies.find(i => i.id === tame.species_id)!;
	return { tame, activity, species };
}
