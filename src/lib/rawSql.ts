import { Prisma } from '@/prisma/main.js';

const u = Prisma.UserScalarFieldEnum;

export const RawSQL = {
	updateCLArray: (userID: string) => `UPDATE users
SET ${u.cl_array} = (
    SELECT (ARRAY(SELECT jsonb_object_keys("${u.collectionLogBank}")::int))
)
WHERE ${u.id} = '${userID}';`,
	sumOfAllCLItems: (clItems: number[]) =>
		`NULLIF(${clItems.map(i => `COALESCE(("collectionLogBank"->>'${i}')::int, 0)`).join(' + ')}, 0)`,
	updateUserLastCommandDate: ({ userId }: { userId: string }) => {
		if (Number.isNaN(Number(userId))) {
			throw new Error(`Invalid userId passed to updateUserLastCommandDate: ${userId}`);
		}
		return prisma.$executeRawUnsafe(`
SET LOCAL synchronous_commit = OFF;
UPDATE USERS
SET last_command_date = now()
WHERE id = '${userId}'`);
	}
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
