import { isMainThread } from 'node:worker_threads';

import { Activity, activity_type_enum, Prisma, PrismaClient } from '@prisma/client';

import { production } from '../../config';
import { ActivityTaskData } from '../types/minions';
import { sqlLog } from '../util/logger';

declare global {
	namespace NodeJS {
		interface Global {
			prisma: PrismaClient | undefined;
		}
	}
}

function makePrismaClient(): PrismaClient {
	if (!isMainThread && !process.env.TEST) return null as any;
	if (!production && !process.env.TEST) console.log('Making prisma client...');
	if (!isMainThread) {
		throw new Error('Prisma client should only be created on the main thread.');
	}

	return new PrismaClient({
		log: [
			{
				emit: 'event',
				level: 'query'
			}
		]
	});
}

export const prisma = global.prisma || makePrismaClient();
global.prisma = prisma;

export let queryCountStore = { value: 0 };

if (isMainThread) {
	// @ts-ignore ignore
	prisma.$on('query' as any, (_query: any) => {
		const query = _query as Prisma.QueryEvent;
		if (!production) {
			sqlLog(query.query);
		}
		queryCountStore.value++;
	});
}

export function convertStoredActivityToFlatActivity(activity: Activity): ActivityTaskData {
	return {
		...(activity.data as Prisma.JsonObject),
		type: activity.type as activity_type_enum,
		userID: activity.user_id.toString(),
		channelID: activity.channel_id.toString(),
		duration: activity.duration,
		finishDate: activity.finish_date.getTime(),
		id: activity.id
	} as ActivityTaskData;
}

/**
 * ⚠️ Uses queryRawUnsafe
 */
export async function countUsersWithItemInCl(itemID: number, ironmenOnly: boolean) {
	const query = `SELECT COUNT(id)::int
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

export async function getUsersActivityCounts(user: MUser) {
	const counts = await prisma.$queryRaw<{ type: activity_type_enum; count: bigint }[]>`SELECT type, COUNT(type)
FROM activity
WHERE user_id = ${BigInt(user.id)}
GROUP BY type;`;

	let result: Record<activity_type_enum, number> = {} as Record<activity_type_enum, number>;
	for (const type of Object.values(activity_type_enum)) {
		result[type] = 0;
	}
	for (const { count, type } of counts) {
		result[type] = Number(count);
	}
	return result;
}
