import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/cache.js';
import { globalConfig } from '@/lib/constants.js';

export async function syncBlacklists() {
	if (!globalConfig.isProduction) {
		return;
	}
	const blacklistedEntities = await roboChimpClient.blacklistedEntity.findMany();
	BLACKLISTED_USERS.clear();
	BLACKLISTED_GUILDS.clear();
	for (const entity of blacklistedEntities) {
		const set = entity.type === 'guild' ? BLACKLISTED_GUILDS : BLACKLISTED_USERS;
		set.add(entity.id.toString());
	}
}
