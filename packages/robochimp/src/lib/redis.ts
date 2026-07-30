import { MockedRedis } from '@oldschoolgg/util';
import { Redis } from 'ioredis';

import { globalConfig } from '@/constants.js';

function makeRedis() {
	if (globalConfig.isProduction) {
		return new Redis();
	} else {
		try {
			const realRedis = new Redis({ reconnectOnError: () => false, maxRetriesPerRequest: 0 });
			let activeRedis: Redis | MockedRedis = realRedis;

			const swapToMock = () => {
				if (activeRedis !== realRedis) return;
				realRedis.disconnect();
				activeRedis = new MockedRedis();
			};

			realRedis.on('error', swapToMock);

			return new Proxy({} as Redis, {
				get(_, property) {
					const value = (activeRedis as any)[property];
					if (typeof value !== 'function') {
						return value;
					}
					return (...args: unknown[]) => {
						try {
							const result = value.apply(activeRedis, args);
							if (result && typeof result.then === 'function') {
								return result.catch((error: unknown) => {
									if (activeRedis === realRedis) {
										swapToMock();
										return (activeRedis as any)[property](...args);
									}
									throw error;
								});
							}
							return result;
						} catch (error) {
							if (activeRedis === realRedis) {
								swapToMock();
								return (activeRedis as any)[property](...args);
							}
							throw error;
						}
					};
				}
			});
		} catch {
			return new MockedRedis() as any as Redis;
		}
	}
}

export const redis: Redis = makeRedis();
