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

export async function countUsersWithItemInCl(itemID: number, ironmenOnly: boolean) {
	if (!Number.isInteger(itemID) || Number.isNaN(itemID)) {
		throw new Error(`Invalid itemID passed to countUsersWithItemInCl: ${itemID}`);
	}

	const itemKey = String(itemID);
	const ironmanFilter = ironmenOnly ? Prisma.sql`AND "minion.ironman" = true` : Prisma.sql``;
	const [result] = await prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(id)::int
                FROM users
                WHERE ("collectionLogBank"->>${itemKey}) IS NOT NULL
                AND ("collectionLogBank"->>${itemKey})::int >= 1
                ${ironmanFilter};
        `;

	const count = Number(result?.count ?? 0);
	if (Number.isNaN(count)) {
		throw new Error(`countUsersWithItemInCl produced invalid number '${count}' for ${itemID}`);
	}
	return count;
}

export async function countUsersWithItemInBank(itemID: number, ironmenOnly: boolean) {
	if (!Number.isInteger(itemID) || Number.isNaN(itemID)) {
		throw new Error(`Invalid itemID passed to countUsersWithItemInBank: ${itemID}`);
	}

	const itemKey = String(itemID);
	const ironmanFilter = ironmenOnly ? Prisma.sql`AND "minion.ironman" = true` : Prisma.sql``;
	const [result] = await prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(DISTINCT id)::int
                FROM users
                WHERE COALESCE((bank ->> ${itemKey})::bigint, 0) > 0
                ${ironmanFilter};
        `;

	const count = Number(result?.count ?? 0);
	if (Number.isNaN(count)) {
		throw new Error(`countUsersWithItemInBank produced invalid number '${count}' for ${itemID}`);
	}
	return count;
}
