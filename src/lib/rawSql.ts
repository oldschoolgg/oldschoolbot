import { Prisma } from '@prisma/client';
import { logError } from './util/logError';

const u = Prisma.UserScalarFieldEnum;

export const RawSQL = {
	fetchUsersWithoutUsernames,
	updateAllUsersCLArrays: () => `UPDATE users
SET ${u.cl_array} = (
    SELECT (ARRAY(SELECT jsonb_object_keys("${u.collectionLogBank}")::int))
)
WHERE last_command_date > now() - INTERVAL '1 week';`,
	updateCLArray: (userID: string) => `UPDATE users
SET ${u.cl_array} = (
    SELECT (ARRAY(SELECT jsonb_object_keys("${u.collectionLogBank}")::int))
)
WHERE ${u.id} = '${userID}';`
};

export async function loggedRawPrismaQuery<T>(query: string): Promise<T | null> {
	try {
		const result = await prisma.$queryRawUnsafe<T>(query);
		return result;
	} catch (err) {
		logError(err, { query: query.slice(0, 100) });
	}

	return null;
}

export async function fetchUsersWithoutUsernames() {
	const res = await loggedRawPrismaQuery<{ id: string }[]>(`
SELECT id
FROM (
    SELECT id,
           username,
           username_with_badges,
           ("skills.agility"  + "skills.cooking"  + "skills.fishing" +
            "skills.mining"   + "skills.smithing" + "skills.woodcutting" +
            "skills.firemaking" + "skills.runecraft" + "skills.crafting" +
            "skills.prayer"   + "skills.fletching" + "skills.thieving" +
            "skills.farming"  + "skills.herblore" + "skills.hunter" +
            "skills.construction" + "skills.magic" + "skills.ranged" +
            "skills.attack"   + "skills.strength" + "skills.defence" +
            "skills.slayer") AS total_xp
    FROM users
    WHERE username IS NULL
) AS t
WHERE total_xp > 100000000
ORDER BY total_xp DESC
LIMIT 60;
`);
	return res!;
}

export const SQL = {
	SELECT_FULL_NAME:
		"TRIM(COALESCE(string_agg(b.text, ' '), '') || ' ' || COALESCE(username, 'Unknown')) AS full_name",
	LEFT_JOIN_BADGES: 'LEFT JOIN badges b ON b.id = ANY(u.badges)',
	GROUP_BY_U_ID: 'GROUP BY u.id',
	WHERE_IRON: (ironOnly: boolean) => (ironOnly ? '"minion.ironman" = true' : '')
} as const;
