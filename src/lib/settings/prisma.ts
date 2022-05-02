import { Activity, activity_type_enum, loot_track_type, Prisma, PrismaClient } from '@prisma/client';
import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { client } from '../..';
import { PerkTier } from '../constants';
import { ItemBank } from '../types';
import { ActivityTaskData } from '../types/minions';
import { cleanString, isGroupActivity } from '../util';
import { logError } from '../util/logError';
import { taskNameFromType } from '../util/taskNameFromType';
import { minionActivityCache, minionActivityCacheDelete } from './settings';

declare global {
	namespace NodeJS {
		interface Global {
			prisma: PrismaClient | undefined;
		}
	}
}
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export function convertStoredActivityToFlatActivity(activity: Activity): ActivityTaskData {
	return {
		...(activity.data as Prisma.JsonObject),
		type: activity.type as activity_type_enum,
		userID: activity.user_id.toString(),
		channelID: activity.channel_id.toString(),
		duration: activity.duration,
		finishDate: activity.finish_date.getTime(),
		id: activity.id
	};
}

export function activitySync(activity: Activity) {
	const users: bigint[] | string[] = isGroupActivity(activity.data)
		? ((activity.data as Prisma.JsonObject).users! as string[])
		: [activity.user_id];
	for (const user of users) {
		minionActivityCache.set(user.toString(), convertStoredActivityToFlatActivity(activity));
	}
}

async function onActivityFinish(activity: ActivityTaskData) {
	const user = client.users.cache.get(activity.userID);
	if (!user) return;

	// If user has easter egg crate, they deliver 1 egg per 10 minutes.
	if (user.owns('Easter egg crate') && activity.duration >= Time.Minute * 10) {
		const numEggs = Math.floor(activity.duration / (Time.Minute * 10));

		await prisma.user.update({
			data: {
				eggs_delivered: {
					increment: numEggs
				}
			},
			where: {
				id: user.id
			}
		});
	}
}

export async function completeActivity(_activity: Activity) {
	const activity = convertStoredActivityToFlatActivity(_activity);
	if (_activity.completed) {
		throw new Error('Tried to complete an already completed task.');
	}

	const taskName = taskNameFromType(activity.type);
	const task = client.tasks.get(taskName);

	if (!task) {
		throw new Error('Missing task');
	}

	client.oneCommandAtATimeCache.add(activity.userID);
	try {
		client.emit('debug', `Running ${task.name} for ${activity.userID}`);
		await task.run(activity);
		await onActivityFinish(activity);
	} catch (err) {
		logError(err);
	} finally {
		client.oneCommandAtATimeCache.delete(activity.userID);
		minionActivityCacheDelete(activity.userID);
	}
}

/**
 * ⚠️ Uses queryRawUnsafe
 */
export async function countUsersWithItemInCl(itemID: number, ironmenOnly: boolean) {
	const query = `SELECT COUNT(id)
				   FROM users
				   WHERE ("collectionLogBank"->>'${itemID}') IS NOT NULL 
				   AND ("collectionLogBank"->>'${itemID}')::int >= 1
				   ${ironmenOnly ? 'AND "minion.ironman" = true' : ''};`;
	const result = parseInt(((await prisma.$queryRawUnsafe(query)) as any)[0].count);
	if (isNaN(result)) {
		throw new Error(`countUsersWithItemInCl produced invalid number '${result}' for ${itemID}`);
	}
	return result;
}

export async function isElligibleForPresent(user: KlasaUser) {
	if (user.isIronman) return true;
	if (user.perkTier >= PerkTier.Four) return true;
	if (user.totalLevel() >= 2000) return true;
	const totalActivityDuration: [{ sum: number }] = await prisma.$queryRawUnsafe(`SELECT SUM(duration)
FROM activity
WHERE user_id = ${BigInt(user.id)};`);
	if (totalActivityDuration[0].sum >= Time.Hour * 80) return true;
	return false;
}

type TrackLootOptions =
	| {
			id: string;
			type: loot_track_type;
			duration: number;
			kc: number;
			teamSize?: number;
			loot: Bank;
			changeType: 'loot';
			suffix?: 'tame';
	  }
	| {
			id: string;
			type: loot_track_type;
			cost: Bank;
			changeType: 'cost';
			suffix?: 'tame';
	  };

export async function trackLoot(opts: TrackLootOptions) {
	let id = cleanString(opts.id).toLowerCase().replace(/ /g, '_');
	if (opts.suffix) {
		id = `${id}-${opts.suffix}`;
	}
	const bank = opts.changeType === 'cost' ? opts.cost : opts.loot;
	if (bank.length === 0) return;

	let duration = opts.changeType === 'loot' ? Math.floor((opts.duration * (opts.teamSize ?? 1)) / Time.Minute) : 0;

	const current = await prisma.lootTrack.findUnique({
		where: {
			id_type: {
				type: opts.type,
				id
			}
		}
	});

	await prisma.lootTrack.upsert({
		where: {
			id_type: {
				type: opts.type,
				id
			}
		},
		update: {
			total_duration:
				opts.changeType === 'loot'
					? {
							increment: duration
					  }
					: undefined,
			total_kc:
				opts.changeType === 'loot'
					? {
							increment: opts.kc
					  }
					: undefined,
			[opts.changeType]: bank.clone().add(current?.[opts.changeType] as ItemBank | undefined).bank
		},
		create: {
			id,
			total_kc: opts.changeType === 'loot' ? opts.kc : 0,
			total_duration: duration,
			[opts.changeType]: bank.bank,
			type: opts.type
		}
	});
}
