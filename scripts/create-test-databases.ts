import { Client } from 'pg';

function databaseConfig(databaseUrl: string) {
	const url = new URL(databaseUrl);
	const databaseName = url.pathname.slice(1);
	if (!databaseName) {
		throw new Error(`Database URL is missing a database name: ${url.origin}`);
	}
	url.pathname = '/postgres';
	return {
		databaseName,
		connectionString: url.toString()
	};
}

function quoteIdentifier(identifier: string) {
	return `"${identifier.replaceAll('"', '""')}"`;
}

async function createDatabaseIfMissing(databaseUrl: string) {
	const { connectionString, databaseName } = databaseConfig(databaseUrl);
	const client = new Client({ connectionString });
	await client.connect();
	try {
		const existing = await client.query<{ exists: boolean }>(
			'SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)',
			[databaseName]
		);
		if (!existing.rows[0].exists) {
			await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
		}
	} finally {
		await client.end();
	}
}

const databaseUrls = [process.env.DATABASE_URL, process.env.ROBOCHIMP_DATABASE_URL].filter(
	(databaseUrl): databaseUrl is string => Boolean(databaseUrl)
);

if (databaseUrls.length === 0) {
	throw new Error('No database URLs configured.');
}

await Promise.all(databaseUrls.map(createDatabaseIfMissing));
