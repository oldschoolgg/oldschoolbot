import { isMainThread } from 'node:worker_threads';
import { TSRedis } from '@oldschoolgg/toolkit/dist/lib/TSRedis';
import { PrismaClient } from '@prisma/client';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';

import { production } from '../config';
import { globalConfig } from './constants';

declare global {
	var prisma: PrismaClient;
	var redis: TSRedis;
	var roboChimpClient: RobochimpPrismaClient;
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
global.prisma = global.prisma || makePrismaClient();

function makeRobochimpPrismaClient(): RobochimpPrismaClient {
	if (!production && !process.env.TEST) console.log('Making robochimp client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Robochimp client should only be created on the main thread.');
	}

	return new RobochimpPrismaClient();
}
global.roboChimpClient = global.roboChimpClient || makeRobochimpPrismaClient();

function makeRedisClient(): TSRedis {
	if (!production && !process.env.TEST) console.log('Making Redis client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Redis client should only be created on the main thread.');
	}
	return new TSRedis({ mocked: !globalConfig.redisPort, port: globalConfig.redisPort });
}
global.redis = global.redis || makeRedisClient();
