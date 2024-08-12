import { Prisma } from '@prisma/client';
import type { ItemBank } from './types';

const u = Prisma.UserScalarFieldEnum;

const RawBSOSQL = {
	leaguesTaskLeaderboard: () => roboChimpClient.$queryRaw<{ id: string; tasks_completed: number }[]>`SELECT id::text, COALESCE(cardinality(leagues_completed_tasks_ids), 0) AS tasks_completed
										  FROM public.user
										  ORDER BY tasks_completed DESC
										  LIMIT 2;`,
	openablesLeaderboard: (id: number) =>
		prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
			`SELECT user_id::text AS id, ("openable_scores"->>'${id}')::int AS score
FROM user_stats
WHERE "openable_scores"->>'${id}' IS NOT NULL
AND ("openable_scores"->>'${id}')::int > 50
ORDER BY ("openable_scores"->>'${id}')::int DESC
LIMIT 50;`
		),
	monkeysFoughtLeaderboard: () =>
		prisma.$queryRawUnsafe<{ id: string }[]>(
			'SELECT id FROM users WHERE monkeys_fought IS NOT NULL ORDER BY cardinality(monkeys_fought) DESC LIMIT 1;'
		),
	inventionDisassemblyLeaderboard: () =>
		prisma.$queryRawUnsafe<{ id: string; uniques: number; disassembled_items_bank: ItemBank }[]>(`SELECT u.id, u.uniques, u.disassembled_items_bank FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("disassembled_items_bank")) uniques, id, disassembled_items_bank FROM users WHERE "skills.invention" > 0
) u
ORDER BY u.uniques DESC LIMIT 300;`)
};

export const RawSQL = {
	updateAllUsersCLArrays: () => `UPDATE users
SET ${u.cl_array} = (
    SELECT (ARRAY(SELECT jsonb_object_keys("${u.collectionLogBank}")::int))
)
WHERE last_command_date > now() - INTERVAL '1 week';`,
	updateCLArray: (userID: string) => `UPDATE users
SET ${u.cl_array} = (
    SELECT (ARRAY(SELECT jsonb_object_keys("${u.collectionLogBank}")::int))
)
WHERE ${u.id} = '${userID}';`,
	...RawBSOSQL
};
