import { RedisKeys } from '@oldschoolgg/util';
import { groupBy } from 'remeda';

import { redis } from '@/lib/redis.js';

export async function syncBlacklists(): Promise<void> {
	const allBlacklist = await roboChimpClient.blacklistedEntity.findMany();
	const { user, guild } = groupBy(allBlacklist, entry => entry.type);
	const transaction = redis.multi().del(RedisKeys.BlacklistedUsers, RedisKeys.BlacklistedGuilds);
	if (user?.length) transaction.sadd(RedisKeys.BlacklistedUsers, ...user.map(entry => entry.id.toString()));
	if (guild?.length) transaction.sadd(RedisKeys.BlacklistedGuilds, ...guild.map(entry => entry.id.toString()));
	const results = await transaction.exec();
	if (!results) throw new Error('Blacklist cache refresh was aborted.');
	for (const [error] of results) {
		if (error) throw error;
	}
}
