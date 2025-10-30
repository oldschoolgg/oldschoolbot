import { CACHED_ACTIVE_USER_IDS } from '@/lib/cache.js';
import { globalConfig } from '@/lib/constants.js';

CACHED_ACTIVE_USER_IDS.add(globalConfig.clientID);

export const syncActiveUserIDs = async () => {
	const users = await prisma.$queryRawUnsafe<{ user_id: string }[]>(`SELECT DISTINCT(id)
FROM users
WHERE last_command_date > now() - INTERVAL '48 hours';`);

	const perkTierUsers = globalConfig.isProduction
		? await roboChimpClient.$queryRawUnsafe<{ id: string }[]>(`SELECT id::text
FROM "user"
WHERE perk_tier > 0;`)
		: [];

	for (const id of [...users.map(i => i.user_id), ...perkTierUsers.map(i => i.id)]) {
		CACHED_ACTIVE_USER_IDS.add(id);
	}
	Logging.logDebug(`${CACHED_ACTIVE_USER_IDS.size} cached active user IDs`);
};

export const emojiServers = new Set([
	'342983479501389826',
	'940758552425955348',
	'869497440947015730',
	'324127314361319427',
	'363252822369894400',
	'395236850119213067',
	'325950337271857152',
	'395236894096621568'
]);
