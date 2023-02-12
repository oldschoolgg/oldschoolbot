import { Activity, activity_type_enum, Prisma, PrismaClient } from '@prisma/client';

import { CLIENT_ID, production } from '../../config';
import { ActivityTaskData } from '../types/minions';

declare global {
	namespace NodeJS {
		interface Global {
			prisma: PrismaClient | undefined;
		}
	}
}

function makePrismaClient(): PrismaClient {
	debugLog('Making prisma client...');
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

export const prismaQueries: Prisma.QueryEvent[] = [];
export let queryCountStore = { value: 0 };
prisma.$on('query' as any, (_query: any) => {
	if (!production && globalClient.isReady()) {
		const query = _query as Prisma.QueryEvent;
		prismaQueries.push(query);
	}
	queryCountStore.value++;
});

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

export async function addToGPTaxBalance(userID: string | string, amount: number) {
	await Promise.all([
		prisma.clientStorage.update({
			where: {
				id: CLIENT_ID
			},
			data: {
				gp_tax_balance: {
					increment: amount
				}
			}
		}),
		prisma.user.update({
			where: {
				id: userID.toString()
			},
			data: {
				total_gp_traded: {
					increment: amount
				}
			}
		})
	]);
}
