import { Prisma } from '@prisma/client';

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
