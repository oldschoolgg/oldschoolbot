import { Prisma } from '@prisma/client';
import { logError } from './util/logError';

const u = Prisma.UserScalarFieldEnum;

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
