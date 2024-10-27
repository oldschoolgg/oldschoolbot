import { isMainThread } from 'node:worker_threads';
import { TSRedis } from '@oldschoolgg/toolkit/structures';
import { PrismaClient } from '@prisma/client';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';

import { production } from '../config';
import { globalConfig } from './constants';
import { handleDeletedPatron, handleEditPatron } from './patreonUtils';

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
		log: ['warn', 'error']
	});
}
global.prisma = global.prisma || makePrismaClient();

function makeRobochimpPrismaClient(): RobochimpPrismaClient {
	if (!production && !process.env.TEST) console.log('Making robochimp client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Robochimp client should only be created on the main thread.');
	}

	return new RobochimpPrismaClient({
		log: ['warn', 'error']
	});
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

global.redis.subscribe(message => {
	debugLog(`Received message from Redis: ${JSON.stringify(message)}`);
	if (message.type === 'patron_tier_change') {
		if (message.new_tier === 0) {
			return handleDeletedPatron(message.discord_ids);
		} else {
			return handleEditPatron(message.discord_ids);
		}
	}
});
