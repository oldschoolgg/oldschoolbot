import { stringMatches } from '@oldschoolgg/toolkit/util';
import { userEventsToMap } from './userEvents';

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
			const SQL_ITEMS = `ARRAY[${items.map(i => `${i}`).join(', ')}]`;
			const userIds = Array.from(userEventMap.keys());
			const userIdsList = userIds.length > 0 ? userIds.map(i => `'${i}'`).join(', ') : 'NULL';

			const query = `
SELECT id, qty
FROM (
    	SELECT id, CARDINALITY(cl_array & ${SQL_ITEMS}) AS qty
    	FROM users
    	WHERE (cl_array && ${SQL_ITEMS}
		${ironmenOnly ? 'AND "users"."minion.ironman" = true' : ''}) ${userIds.length > 0 ? `OR id IN (${userIdsList})` : ''}
	) AS subquery
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
