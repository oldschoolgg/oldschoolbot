import { isMainThread } from 'node:worker_threads';
import { PrismaClient } from '@prisma/client';

import { globalConfig } from './constants';

declare global {
	var prisma: PrismaClient;
}

function makePrismaClient(): PrismaClient {
	if (!globalConfig.isProduction && !process.env.TEST) console.log('Making prisma client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Prisma client should only be created on the main thread.');
	}

	return new PrismaClient({
		log: ['info', 'warn', 'error']
	});
}
global.prisma = global.prisma || makePrismaClient();
