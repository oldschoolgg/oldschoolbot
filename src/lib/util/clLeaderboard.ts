import { prisma } from '../settings/prisma';

export async function fetchCLLeaderboard({
	ironmenOnly,
	items,
	resultLimit,
	method = 'cl_array'
}: {
	ironmenOnly: boolean;
	items: number[];
	resultLimit: number;
	method?: 'cl_array' | 'raw_cl';
}) {
	if (method === 'cl_array') {
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
  WHERE "collectionLogBank" ?| array[${items.map(i => `'${i}'`).join(', ')}]
  ${ironmenOnly ? 'AND "minion.ironman" = true' : ''}
) u
ORDER BY qty DESC
LIMIT ${resultLimit};
`)
	).filter(i => i.qty > 0);

	return users;
}
