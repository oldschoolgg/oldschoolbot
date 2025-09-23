import { isMainThread } from 'node:worker_threads';
import { PrismaClient } from '@prisma/client';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';

import { globalConfig } from '@/lib/constants';

declare global {
	var prisma: PrismaClient;
	var roboChimpClient: RobochimpPrismaClient;
}

function makePrismaClient(): PrismaClient {
	if (!globalConfig.isProduction && !process.env.TEST) console.log('Making prisma client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Prisma client should only be created on the main thread.');
	}

	return new PrismaClient({
		log: ['warn', 'error']
	});
}
global.prisma = global.prisma || makePrismaClient();

function makeRobochimpPrismaClient(): RobochimpPrismaClient {
	if (!globalConfig.isProduction && !process.env.TEST) console.log('Making robochimp client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Robochimp client should only be created on the main thread.');
	}

	return new RobochimpPrismaClient({
		log: ['warn', 'error']
	});
}
global.roboChimpClient = global.roboChimpClient || makeRobochimpPrismaClient();
