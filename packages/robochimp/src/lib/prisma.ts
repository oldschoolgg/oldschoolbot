import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { rewriteSqlToIdempotent, Stopwatch } from '@oldschoolgg/toolkit';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as BSOPrismaClient } from '@prisma/bso';
import { PrismaClient as OSBPrismaClient } from '@prisma/osb';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';
import { PrismaPGlite } from 'pglite-prisma-adapter';

import { globalConfig } from '@/constants.js';

declare global {
	var roboChimpClient: RobochimpPrismaClient;
	var osbClient: OSBPrismaClient;
	var bsoClient: BSOPrismaClient;
}

async function getAdapter(type: 'osb' | 'bso' | 'robochimp'): Promise<PrismaPg> {
	const sw = new Stopwatch();
	sw.check(`Getting adapter for ${type}`);
	const shouldUseRealPostgres = globalConfig.isProduction || process.env.USE_REAL_PG === '1';
	if (shouldUseRealPostgres) {
		sw.check(`Using Postgres for ${type}`);
		return new PrismaPg({ connectionString: process.env[`${type.toUpperCase()}_DATABASE_URL`] });
	}
	sw.check(`Using PGLite for ${type} DB`);

	if (!existsSync('./.db')) {
		mkdirSync('./.db');
		sw.check(`Created dir`);
	}
	const dataDir = `./.db/${type.toLowerCase()}${process.env.TEST ? '-test' : ''}`;
	const pgLiteClient = new PGlite({ dataDir });
	const createDbSQL = execSync(
		`prisma migrate diff --from-empty --to-schema-datamodel ./prisma/${type}_schema.prisma --script`,
		{
			encoding: 'utf-8'
		}
	);
	await pgLiteClient.exec(rewriteSqlToIdempotent(createDbSQL));
	sw.check(`Ensured migrated`);
	return new PrismaPGlite(pgLiteClient) as any as PrismaPg;
}

export async function initPrismaClients() {
	console.log('Initializing Prisma clients');
	global.roboChimpClient =
		global.roboChimpClient ??
		new RobochimpPrismaClient({
			adapter: await getAdapter('robochimp')
		});
	global.osbClient = global.osbClient ?? new OSBPrismaClient({ adapter: await getAdapter('osb') });
	global.bsoClient = global.bsoClient ?? new BSOPrismaClient({ adapter: await getAdapter('bso') });
}

export { BSOPrismaClient, OSBPrismaClient, RobochimpPrismaClient };
