import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { isMainThread } from 'node:worker_threads';
import { PGlite } from '@electric-sql/pglite';
import { rewriteSqlToIdempotent } from '@oldschoolgg/toolkit';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';
import { PrismaPGlite } from 'pglite-prisma-adapter';

import { BOT_TYPE, globalConfig } from '@/lib/constants.js';

async function getAdapter(
	type: typeof BOT_TYPE | 'robochimp'
): Promise<{ adapter: PrismaPg; pgLiteClient: PGlite | null }> {
	if (globalConfig.isProduction) {
		return { adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }), pgLiteClient: null };
	}

	if (!existsSync('./.db')) {
		mkdirSync('./.db');
	}
	const dataDir = `./.db/${type.toLowerCase()}${process.env.TEST ? '-test' : ''}`;
	const pgLiteClient = new PGlite({ dataDir });
	const createDbSQL = execSync(
		`prisma migrate diff --from-empty --to-schema-datamodel ./prisma/${type === 'robochimp' ? 'robochimp' : 'schema'}.prisma --script`,
		{
			encoding: 'utf-8'
		}
	);
	await pgLiteClient.exec(rewriteSqlToIdempotent(createDbSQL));
	const adapter = new PrismaPGlite(pgLiteClient) as any as PrismaPg;
	return { adapter, pgLiteClient };
}

interface BotDB {
	prismaClient: PrismaClient;
	adapter: PrismaPg;
	pgLiteClient: PGlite | null;
}
async function makePrismaClient(): Promise<BotDB> {
	if (!globalConfig.isProduction && !process.env.TEST) console.log('Making prisma client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Prisma client should only be created on the main thread.');
	}

	const { adapter, pgLiteClient } = await getAdapter(BOT_TYPE);

	const prismaClient = new PrismaClient({
		log: ['warn', 'error'],
		adapter
	});
	return { prismaClient, adapter, pgLiteClient };
}

interface RoboChimpDB {
	prismaClient: RobochimpPrismaClient;
	adapter: PrismaPg;
	pgLiteClient: PGlite | null;
}
async function makeRobochimpPrismaClient(): Promise<RoboChimpDB> {
	if (!globalConfig.isProduction && !process.env.TEST) console.log('Making robochimp client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Robochimp client should only be created on the main thread.');
	}

	const { adapter, pgLiteClient } = await getAdapter('robochimp');
	const prismaClient = new RobochimpPrismaClient({
		log: ['warn', 'error'],
		adapter
	});
	return { prismaClient, adapter, pgLiteClient };
}

export async function createDb() {
	global.prisma = global.prisma || (await makePrismaClient()).prismaClient;
	global.roboChimpClient = global.roboChimpClient || (await makeRobochimpPrismaClient()).prismaClient;
	console.log('Connected to the database.');
	return { prisma: global.prisma, roboChimpClient: global.roboChimpClient };
}

declare global {
	var prisma: PrismaClient;
	var roboChimpClient: RobochimpPrismaClient;
}
