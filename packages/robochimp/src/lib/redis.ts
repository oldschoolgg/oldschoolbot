import { MockedRedis } from '@oldschoolgg/util';
import { Redis } from 'ioredis';

import { globalConfig } from '@/constants.js';

const RUSER_CACHE_TTL_SECONDS = 24 * 60 * 60;

export function rUserTTL() {
	const jitter = RUSER_CACHE_TTL_SECONDS * 0.1;
	return Math.round(RUSER_CACHE_TTL_SECONDS - jitter + Math.random() * jitter * 2);
}

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
