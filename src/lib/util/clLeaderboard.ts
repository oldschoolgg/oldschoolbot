import { stringMatches } from '@oldschoolgg/toolkit';

import { SQL } from '@/lib/rawSql.js';
import { userEventsToMap } from '@/lib/util/userEvents.js';

export async function fetchMultipleCLLeaderboards(
	leaderboards: {
		ironmenOnly: boolean;
		items: number[];
		resultLimit: number;
		clName: string;
	}[]
) {
	const userEvents = await prisma.userEvent.findMany({
		where: {
			type: 'CLCompletion'
		},
		orderBy: {
			date: 'asc'
		}
	});
	const parsedLeaderboards = leaderboards.map(l => {
		const userEventMap = userEventsToMap(
			userEvents.filter(e => e.collection_log_name && stringMatches(e.collection_log_name, l.clName))
		);
		return {
			...l,
			userEventMap
		};
	});

	const results = await prisma.$transaction([
		...parsedLeaderboards.map(({ items, userEventMap, ironmenOnly, resultLimit }) => {
			const userIds = Array.from(userEventMap.keys());
			const userIdsList = userIds.length > 0 ? userIds.map(i => `'${i}'`).join(', ') : 'NULL';

			const query = `
SELECT u.id,
       COUNT(*)::int AS qty,
       TRIM(COALESCE(string_agg(b.text, ' '), '') || ' ' || COALESCE(username, 'Unknown')) AS full_name
FROM users u
${SQL.LEFT_JOIN_BADGES}
JOIN LATERAL (
  SELECT 1
  FROM UNNEST(u.cl_array) AS val
  WHERE val = ANY(ARRAY[${items.join(', ')}])
) t ON TRUE
${ironmenOnly ? 'WHERE "u"."minion.ironman" = true' : ''}
${userIds.length > 0 ? `OR u.id IN (${userIdsList})` : ''}
${SQL.GROUP_BY_U_ID}
ORDER BY qty DESC
LIMIT ${resultLimit};
`;
			return prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(query);
		})
	]);

	return results.map((res, index) => {
		const src = parsedLeaderboards[index];

		const users = res
			.sort((a, b) => {
				const valueDifference = b.qty - a.qty;
				if (valueDifference !== 0) {
					return valueDifference;
				}
				const dateA = src.userEventMap.get(a.id);
				const dateB = src.userEventMap.get(b.id);
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

		return {
			...src,
			users
		};
	});
}

export async function fetchCLLeaderboard({
	ironmenOnly,
	items,
	resultLimit,
	clName
}: {
	ironmenOnly: boolean;
	items: number[];
	resultLimit: number;
	method?: 'cl_array';
	clName: string;
}) {
	const result = await fetchMultipleCLLeaderboards([{ ironmenOnly, items, resultLimit, clName }]);
	return result[0];
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
