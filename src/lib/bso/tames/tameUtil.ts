import {
	seaMonkeySpells,
	type TameTaskOptions,
	TameType,
	tameKillableMonsters,
	tameSpecies
} from '@/lib/bso/tames/tames.js';

import { formatDuration, round } from '@oldschoolgg/toolkit';
import { type Tame, type TameActivity, tame_growth } from '@prisma/client';
import { type ItemBank, Items } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { getSimilarItems } from '@/lib/data/similarItems.js';

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
			return `Collecting ${Items.itemNameFromId(data.itemID)}`;
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

export function getTameStatus(tameActivity: TameActivity | null) {
	if (tameActivity) {
		const currentDate = Date.now();
		const timeRemaining = `${formatDuration(tameActivity.finish_date.valueOf() - currentDate, true)} remaining`;
		const activityData = tameActivity.data as any as TameTaskOptions;
		switch (activityData.type) {
			case TameType.Combat:
				return [
					`Killing ${activityData.quantity.toLocaleString()}x ${
						tameKillableMonsters.find(m => m.id === activityData.monsterID)?.name
					}`,
					timeRemaining
				];
			case TameType.Gatherer:
				return [`Collecting ${Items.itemNameFromId(activityData.itemID)?.toLowerCase()}`, timeRemaining];
			case 'SpellCasting':
				return [
					`Casting ${seaMonkeySpells.find(i => i.id === activityData.spellID)!.name} ${
						activityData.quantity
					}x times`,
					timeRemaining
				];
			case 'Tempoross':
				return ['Fighting the Tempoross', timeRemaining];
			case 'Wintertodt':
				return ['Fighting the Wintertodt', timeRemaining];
			case 'Clues': {
				const tier = ClueTiers.find(i => i.scrollID === activityData.clueID);
				return [`Completing ${tier!.name} clues`, timeRemaining];
			}
		}
	}
	return ['Idle'];
}
