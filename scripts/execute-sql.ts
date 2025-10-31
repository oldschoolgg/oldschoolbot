import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

import { BOT_TYPE } from '@/lib/constants.js';

const dbConnectionString = process.env.DATABASE_URL!.split('?')[0];

const client = new Client({ connectionString: dbConnectionString });
await client.connect();

console.log(`Starting SQL execution for ${BOT_TYPE}...`);
function log(msg: string) {
	console.log(`	[${BOT_TYPE} - Execute SQL] ${msg}`);
}

for (const file of ['extensions', 'functions', 'check_constraints', 'indexes', 'exec']) {
	const sql = readFileSync(path.join(process.cwd(), `./prisma/sql/${file}.sql`), 'utf8');
	const start = performance.now();
	await client.query(sql);
	log(`Executed ${file}.sql in ${(performance.now() - start).toFixed(2)} ms`);
}

await client.end();
log('Executed all SQL scripts.');
