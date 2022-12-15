import { prisma } from '../settings/prisma';

export async function fetchCLLeaderboard({
	ironmenOnly,
	items,
	resultLimit
}: {
	ironmenOnly: boolean;
	items: number[];
	resultLimit: number;
}) {
	const users = (
		await prisma.$queryRawUnsafe<{ id: string; qty: number }[]>(`
	SELECT user_id::text AS id, CARDINALITY(cl_array) - CARDINALITY(cl_array - array[${items
		.map(i => `${i}`)
		.join(', ')}]) AS qty
	FROM user_stats
	${ironmenOnly ? 'INNER JOIN "users" on "users"."id" = "user_stats"."user_id"::text' : ''}
	WHERE cl_array && array[${items.map(i => `${i}`).join(', ')}]
	${ironmenOnly ? 'AND "users"."minion.ironman" = true' : ''}
	ORDER BY qty DESC
	LIMIT ${resultLimit};
	`)
	).filter(i => i.qty > 0);

	return users;
}
