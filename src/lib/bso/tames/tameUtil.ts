import type { MTame } from '@/lib/bso/structures/MTame.js';
import { seaMonkeySpells, type TameTaskOptions, TameType, tameKillableMonsters } from '@/lib/bso/tames/tames.js';

import { formatDuration } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import type { TameActivity } from '@/prisma/main.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';

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

export function calculateMaximumTameFeedingLevelGain(tame: MTame) {
	const mainLevel = tame.relevantLevel();
	if (mainLevel >= 100) return 0;
	const difference = 100 - mainLevel;
	return Math.floor(difference / 2) - 1;
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

export function sortTames(tameA: MTame, tameB: MTame): number {
	if (tameA.isShiny) return -1;
	if (tameB.isShiny) return 1;
	if (tameA.lastActivityDate && !tameB.lastActivityDate) return -1;
	if (!tameA.lastActivityDate && tameB.lastActivityDate) return 1;
	if (tameA.lastActivityDate && tameB.lastActivityDate) {
		return tameB.lastActivityDate.valueOf() - tameA.lastActivityDate.valueOf();
	}
	// Fallback to sorting by max_combat_level if no last_activity_date for both
	return tameB.relevantLevel() - tameA.relevantLevel();
}
