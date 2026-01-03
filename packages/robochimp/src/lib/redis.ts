import { Redis } from 'ioredis';

import { globalConfig } from '@/constants.js';
import { MockedRedis } from '@/lib/redis-mock.js';

function makeRedis() {
	if (globalConfig.isProduction) {
		return new Redis();
	} else {
		try {
			const redis = new Redis({ reconnectOnError: () => false });
			redis.on('error', () => {
				redis.disconnect();
				return new MockedRedis() as any as Redis;
			});
			return redis;
		} catch {
			return new MockedRedis() as any as Redis;
		}
	}
}

export const redis: Redis = makeRedis();
