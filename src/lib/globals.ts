import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { rewriteSqlToIdempotent } from '@oldschoolgg/toolkit';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaPGlite } from 'pglite-prisma-adapter';

import { PrismaClient as RobochimpPrismaClient } from '@/prisma/clients/robochimp/client.js';
import { PrismaClient } from '@/prisma/main.js';
import { BOT_TYPE, globalConfig } from '@/lib/constants.js';

async function getAdapter(
	type: typeof BOT_TYPE | 'robochimp'
): Promise<{ adapter: PrismaPg; pgLiteClient: PGlite | null }> {
	const shouldUseRealPostgres = globalConfig.isProduction || process.env.USE_REAL_PG === '1';
	if (shouldUseRealPostgres) {
		const connectionString = type === 'robochimp' ? process.env.ROBOCHIMP_DATABASE_URL : process.env.DATABASE_URL;
		Logging.logDebug(`Using Real Postgres for ${type} database`);
		return {
			adapter: new PrismaPg(
				{
					connectionString,
					idleTimeoutMillis: 60_000,
					max: 100,
					min: 20
				},
				{ onPoolError: Logging.logError, onConnectionError: Logging.logError }
			),
			pgLiteClient: null
		};
	}

	Logging.logDebug(`Using PGLite for ${type} database`);
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

async function makePrismaClient() {
	const { adapter, pgLiteClient } = await getAdapter(BOT_TYPE);
	const prismaClient = new PrismaClient({
		log: [{ emit: 'event', level: 'query' }, 'info', 'warn'],
		adapter,
		transactionOptions: {
			maxWait: 15_000,
			timeout: 250_000
		}
	});
	prismaClient.$on('query', e => {
		const info = {
			text: `Prisma Query`,
			duration: e.duration,
			query: e.query,
			params: e.params,
			target: 'bot-db'
		};
		if (info.query.length > 1000) {
			info.query = `${info.query.slice(0, 1000)}...`;
		}
		if (info.params.length > 1000) {
			info.params = `${info.params.slice(0, 1000)}...`;
		}
		Logging.logPerf(info);
	});
	return { prismaClient, adapter, pgLiteClient };
}

interface RoboChimpDB {
	prismaClient: RobochimpPrismaClient;
	adapter: PrismaPg | PrismaPGlite;
	pgLiteClient: PGlite | null;
}
async function makeRobochimpPrismaClient(): Promise<RoboChimpDB> {
	const { adapter, pgLiteClient } = await getAdapter('robochimp');
	const prismaClient = new RobochimpPrismaClient({
		log: ['warn'],
		adapter
	});
	return { prismaClient, adapter, pgLiteClient };
}

export async function createDb() {
	global.prisma = global.prisma || (await makePrismaClient()).prismaClient;
	global.roboChimpClient = global.roboChimpClient || (await makeRobochimpPrismaClient()).prismaClient;
	return { prisma: global.prisma, roboChimpClient: global.roboChimpClient };
}

declare global {
	var prisma: PrismaClient;
	var roboChimpClient: RobochimpPrismaClient;
}
