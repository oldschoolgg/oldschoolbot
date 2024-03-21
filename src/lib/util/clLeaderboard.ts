import { UserEvent } from '@prisma/client';

import { prisma } from '../settings/prisma';
import { userEventsToMap } from './userEvents';

export async function fetchCLLeaderboard({
	ironmenOnly,
	items,
	resultLimit,
	method = 'cl_array',
	userEvents
}: {
	ironmenOnly: boolean;
	items: number[];
	resultLimit: number;
	method?: 'cl_array' | 'raw_cl';
	userEvents: UserEvent[] | null;
}) {
	const userEventMap = userEventsToMap(userEvents);
	const userIds = Array.from(userEventMap.keys());
	if (method === 'cl_array') {
		const [specificUsers, generalUsers] = await prisma.$transaction([
			prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(`
    SELECT user_id::text AS id, CARDINALITY(cl_array) - CARDINALITY(cl_array - array[${items
		.map(i => `${i}`)
		.join(', ')}]) AS qty
    FROM user_stats
    WHERE user_id::text in (${userIds.map(i => `'${i}'`).join(', ')})
`),
			prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(`
    SELECT user_id::text AS id, CARDINALITY(cl_array) - CARDINALITY(cl_array - array[${items
		.map(i => `${i}`)
		.join(', ')}]) AS qty
    FROM user_stats
    ${ironmenOnly ? 'INNER JOIN "users" on "users"."id" = "user_stats"."user_id"::text' : ''}
    WHERE (cl_array && array[${items.map(i => `${i}`).join(', ')}]
    ${ironmenOnly ? 'AND "users"."minion.ironman" = true' : ''})
    AND user_id::text NOT IN (${userIds.map(i => `'${i}'`).join(', ')})
    ORDER BY qty DESC
    LIMIT ${resultLimit}
`)
		]);

		const users = [...specificUsers, ...generalUsers]
			.sort((a, b) => {
				const valueDifference = b.qty - a.qty;
				if (valueDifference !== 0) {
					return valueDifference;
				}
				const dateA = userEventMap.get(a.id);
				const dateB = userEventMap.get(b.id);
				if (dateA && dateB) {
					return dateA - dateB;
				}
				if (dateA) {
					return -1;
				}
				if (dateB) {
					return 1;
				}
				return 0;
			})
			.filter(i => i.qty > 0);
		return users;
	}
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(`
SELECT id, (cardinality(u.cl_keys) - u.inverse_length) as qty
				  FROM (
  SELECT array(SELECT * FROM jsonb_object_keys("collectionLogBank")) "cl_keys",
  				id, "collectionLogBank",
			    cardinality(array(SELECT * FROM jsonb_object_keys("collectionLogBank" - array[${items
					.map(i => `'${i}'`)
					.join(', ')}]))) "inverse_length"
  FROM users
  WHERE ("collectionLogBank" ?| array[${items.map(i => `'${i}'`).join(', ')}]
  ${ironmenOnly ? 'AND "minion.ironman" = true' : ''})
  OR user_id::text in (${userIds.map(i => `'${i}'`).join(', ')})
) u
ORDER BY qty DESC
LIMIT ${resultLimit};
`)
	).filter(i => i.qty > 0);

	return users;
}

export async function fetchTameCLLeaderboard({ items, resultLimit }: { items: number[]; resultLimit: number }) {
	const users = (
		await prisma.$queryRawUnsafe<{ user_id: string; qty: number }[]>(`
SELECT user_id::text, (cardinality(u.cl_keys) - u.inverse_length) as qty
				  FROM (
  SELECT array(SELECT * FROM jsonb_object_keys("tame_cl_bank")) "cl_keys",
  				user_id, "tame_cl_bank",
			    cardinality(array(SELECT * FROM jsonb_object_keys("tame_cl_bank" - array[${items
					.map(i => `'${i}'`)
					.join(', ')}]))) "inverse_length"
  FROM user_stats
  WHERE "tame_cl_bank" ?| array[${items.map(i => `'${i}'`).join(', ')}]
) u
ORDER BY qty DESC
LIMIT ${resultLimit};
`)
	).filter(i => i.qty > 0);
	return users;
}
