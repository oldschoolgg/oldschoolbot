import { isMainThread } from 'node:worker_threads';
import { TSRedis } from '@oldschoolgg/toolkit/dist/lib/TSRedis';
import { PrismaClient } from '@prisma/client';

import { production } from '../config';
import { globalConfig } from './constants';

declare global {
	var prisma: PrismaClient;
	var redis: TSRedis;
}

function makePrismaClient(): PrismaClient {
	if (!production && !process.env.TEST) console.log('Making prisma client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Prisma client should only be created on the main thread.');
	}

	return new PrismaClient({
		log: [
			{
				emit: 'event',
				level: 'query'
			}
		]
	});
}
// biome-ignore lint/suspicious/noRedeclare: <explanation>
const prisma = global.prisma || makePrismaClient();
global.prisma = prisma;

function makeRedisClient(): TSRedis {
	if (!production && !process.env.TEST) console.log('Making Redis client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Redis client should only be created on the main thread.');
	}
	return new TSRedis({ mocked: !globalConfig.redisPort, port: globalConfig.redisPort });
}
// biome-ignore lint/suspicious/noRedeclare: <explanation>
const redis = global.redis || makeRedisClient();
global.redis = redis;
