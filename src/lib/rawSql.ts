import type { ItemBank } from 'oldschooljs';

import { Prisma } from '@/prisma/main.js';

const u = Prisma.UserScalarFieldEnum;

const RawBSOSQL = {
	leaguesTaskLeaderboard: () => roboChimpClient.$queryRaw<
		{ id: string; tasks_completed: number }[]
	>`SELECT id::text, COALESCE(cardinality(leagues_completed_tasks_ids), 0) AS tasks_completed
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
		prisma.$queryRawUnsafe<
			{ id: string; uniques: number; disassembled_items_bank: ItemBank }[]
		>(`SELECT u.id, u.uniques, u.disassembled_items_bank FROM (
  SELECT (SELECT COUNT(*) FROM JSON_OBJECT_KEYS("disassembled_items_bank")) uniques, id, disassembled_items_bank FROM users WHERE "skills.invention" > 0
) u
ORDER BY u.uniques DESC LIMIT 300;`)
};

export const RawSQL = {
	updateCLArray: (userID: string) => `UPDATE users
SET ${u.cl_array} = (
    SELECT (ARRAY(SELECT jsonb_object_keys("${u.collectionLogBank}")::int))
)
WHERE ${u.id} = '${userID}';`,
	sumOfAllCLItems: (clItems: number[]) =>
		`NULLIF(${clItems.map(i => `COALESCE(("collectionLogBank"->>'${i}')::int, 0)`).join(' + ')}, 0)`,
	...RawBSOSQL
};

export const SQL = {
	SELECT_FULL_NAME:
		"TRIM(COALESCE(string_agg(b.text, ' '), '') || ' ' || COALESCE(username, 'Unknown')) AS full_name",
	LEFT_JOIN_BADGES: 'LEFT JOIN badges b ON b.id = ANY(u.badges)',
	GROUP_BY_U_ID: 'GROUP BY u.id',
	WHERE_IRON: (ironOnly: boolean) => (ironOnly ? '"minion.ironman" = true' : '')
} as const;

/**
 * ⚠️ Uses queryRawUnsafe
 */
export async function countUsersWithItemInCl(itemID: number, ironmenOnly: boolean) {
	const query = `SELECT COUNT(id)::int
				   FROM users
				   WHERE ("collectionLogBank"->>'${itemID}') IS NOT NULL
				   AND ("collectionLogBank"->>'${itemID}')::int >= 1
				   ${ironmenOnly ? 'AND "minion.ironman" = true' : ''};`;
	const result = Number.parseInt(((await prisma.$queryRawUnsafe(query)) as any)[0].count);
	if (Number.isNaN(result)) {
		throw new Error(`countUsersWithItemInCl produced invalid number '${result}' for ${itemID}`);
	}
	return result;
}
