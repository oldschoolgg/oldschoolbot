import { RedisKeys } from '@oldschoolgg/util';
import { groupBy } from 'remeda';

import { redis } from '@/lib/redis.js';

export async function syncBlacklists(): Promise<void> {
	const allBlacklist = await roboChimpClient.blacklistedEntity.findMany();
	const a = groupBy(allBlacklist, b => b.type);
	await redis.del(RedisKeys.BlacklistedUsers);
	if (a.user) {
		await redis.sadd(RedisKeys.BlacklistedUsers, ...a.user.map(b => b.id.toString()));
	}
	await redis.del(RedisKeys.BlacklistedGuilds);
	if (a.guild) {
		await redis.sadd(RedisKeys.BlacklistedGuilds, ...a.guild.map(b => b.id.toString()));
	}
}
