import { execSync } from 'node:child_process';
import { isMainThread } from 'node:worker_threads';
import { PGlite } from '@electric-sql/pglite';
import { PrismaClient } from '@prisma/client';
import { PrismaClient as RobochimpPrismaClient } from '@prisma/robochimp';
import { PrismaPGlite } from 'pglite-prisma-adapter';

import { BOT_TYPE, globalConfig } from '@/lib/constants.js';

declare global {
	var prisma: PrismaClient;
	var roboChimpClient: RobochimpPrismaClient;
}

// export const intarray: Extension = {
//   name: 'intarray',
//   setup: async (pg, emscriptenOpts, clientOnly = false) => {
//     if (clientOnly) {
//       return { namespaceObj: {} }
//     }
//     // bundlePath points to the compiled intarray extension .tar or .so
//     const bundlePath = new URL('./intarray.tar', import.meta.url)
//     return {
//       emscriptenOpts,
//       bundlePath,
//       init: async () => {
//         await pg.exec(`CREATE EXTENSION IF NOT EXISTS intarray;`)
//       },
//       close: async () => { /* nothing */ },
//       namespaceObj: {
//         // optional JS APIs e.g. wrappers
//         icount: async (arr: number[]) => {
//           const res = await pg.query(`SELECT icount($1::int[]);`, [arr])
//           return res.rows[0].icount as number
//         }
//       }
//     }
//   }
// }

function parseSql(sql: string) {
	const rules: [RegExp, string | ((...a: any[]) => string)][] = [
		[/\bCREATE\s+TABLE\s+("?[\w]+"?)/gi, 'CREATE TABLE IF NOT EXISTS $1'],
		[/\bCREATE\s+UNIQUE\s+INDEX\s+("?[\w]+"?)/gi, 'CREATE UNIQUE INDEX IF NOT EXISTS $1'],
		[/\bCREATE\s+INDEX\s+("?[\w]+"?)/gi, 'CREATE INDEX IF NOT EXISTS $1'],
		[/\bCREATE\s+SCHEMA\s+("?[\w]+"?)/gi, 'CREATE SCHEMA IF NOT EXISTS $1'],
		[/\bCREATE\s+VIEW\s+("?[\w]+"?)/gi, 'CREATE OR REPLACE VIEW $1'],
		[
			/\bCREATE\s+TYPE\s+("?[\w]+"?)\s+AS\s+ENUM\s*\(([^;]+)\);/gi,
			(_m, name, values) =>
				`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = ${name.replace(/"/g, "'")}) THEN
        CREATE TYPE ${name} AS ENUM (${values.trim()});
    END IF;
END $$;`
		],
		[
			/\bALTER\s+TABLE\s+("?[\w]+"?)\s+ADD\s+CONSTRAINT\s+("?[\w]+"?)([^;]*);/gi,
			(_m, table, constraint, rest) =>
				`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraint};
ALTER TABLE ${table} ADD CONSTRAINT ${constraint}${rest.trim()};`
		]
	];
	for (const [r, sub] of rules) {
		sql = typeof sub === 'string' ? sql.replace(r, sub) : sql.replace(r, (...a) => sub(...a));
	}
	return sql;
}


function getPgLitePath(name: string) {
	if (globalConfig.isProduction || process.env.NODE_ENV === 'production') {
		throw new Error('PGlite path is only available in development mode.');
	}
	return `./.db/${name.toLowerCase()}${process.env.TEST ? '-test' : ''}`;
}
function makePrismaClient(): PrismaClient {
	const start = performance.now();
	if (!globalConfig.isProduction && !process.env.TEST) console.log('Making prisma client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Prisma client should only be created on the main thread.');
	}
	const sql = execSync(`prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script`, {
		encoding: 'utf-8'
	});

	const client = new PGlite({
		dataDir: getPgLitePath(BOT_TYPE),
	});
	client.exec(parseSql(sql));
	const end = performance.now();
	console.log(`PGlite database setup took ${(end - start).toFixed(2)}ms`);
	const adapter = new PrismaPGlite(client);
	return new PrismaClient({
		log: ['warn', 'error'],
		adapter,
	});
}

function makeRobochimpPrismaClient(): RobochimpPrismaClient {
	if (!globalConfig.isProduction && !process.env.TEST) console.log('Making robochimp client...');
	if (!isMainThread && !process.env.TEST) {
		throw new Error('Robochimp client should only be created on the main thread.');
	}
	const sql = execSync(`prisma migrate diff --from-empty --to-schema-datamodel ./prisma/robochimp.prisma --script`, {
		encoding: 'utf-8'
	});
	const client = new PGlite({
		dataDir: getPgLitePath('robochimp'),
	});
	client.exec(parseSql(sql));
	const adapter = new PrismaPGlite(client);
	return new RobochimpPrismaClient({
		log: ['warn', 'error'],
		adapter
	});
}

export async function createDb() {
	global.prisma = global.prisma || makePrismaClient();
	global.roboChimpClient = global.roboChimpClient || makeRobochimpPrismaClient();
	console.log('Connected to the database.');
	return { prisma: global.prisma, roboChimpClient: global.roboChimpClient };
}
