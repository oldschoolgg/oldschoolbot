import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';

import { globalConfig } from '@/constants.js';

declare global {
	var roboChimpClient: RobochimpPrismaClient;
}

export async function initPrismaClients() {
	const connectionString = globalConfig.robochimpDatabaseUrl ?? process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('ROBOCHIMP_DATABASE_URL or DATABASE_URL is required for OSB Reactions.');
	}

	global.roboChimpClient =
		global.roboChimpClient ??
		new RobochimpPrismaClient({
			adapter: new PrismaPg({ connectionString })
		});
}

export { RobochimpPrismaClient };
