import { Prisma } from '@prisma/client';

const u = Prisma.UserScalarFieldEnum;

export const RawSQL = {
	updateCLArray: (userID: string) => `UPDATE users
SET ${u.cl_array} = (
    SELECT (ARRAY(SELECT jsonb_object_keys("${u.collectionLogBank}")::int))
)
WHERE ${u.id} = '${userID}';`
};
