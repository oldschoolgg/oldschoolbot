import { OWNER_IDS } from '../../config';
import { globalConfig } from '../constants';

export const CACHED_ACTIVE_USER_IDS = new Set();
CACHED_ACTIVE_USER_IDS.add(globalConfig.clientID);
for (const id of OWNER_IDS) CACHED_ACTIVE_USER_IDS.add(id);

export async function syncActiveUserIDs() {
	const [users, otherUsers] = await Promise.all([
		prisma.$queryRaw<{ user_id: string }[]>`SELECT DISTINCT(user_id::text)
FROM command_usage
WHERE date > now() - INTERVAL '72 hours';`,
		prisma.$queryRaw<{ id: string }[]>`SELECT id
FROM users
WHERE main_account IS NOT NULL
      OR CARDINALITY(ironman_alts) > 0
	  OR bitfield && ARRAY[2,3,4,5,6,7,8,12,11,21,19];`
	]);

	for (const id of [...users.map(i => i.user_id), ...otherUsers.map(i => i.id)]) {
		CACHED_ACTIVE_USER_IDS.add(id);
	}
	debugLog(`${CACHED_ACTIVE_USER_IDS.size} cached active user IDs`);
}
