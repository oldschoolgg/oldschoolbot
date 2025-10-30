import { Cache } from '@/lib/cache/redis.js';
import { globalConfig } from '@/lib/constants.js';

export async function populateRoboChimpCache() {
	if (!globalConfig.isProduction) {
		return;
	}
	const users = await roboChimpClient.user.findMany({
		where: {
			perk_tier: {
				not: 0
			}
		}
	});
	for (const user of users) {
		Cache.setRoboChimpUser(user);
	}
}
