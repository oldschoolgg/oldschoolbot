import { Client } from 'pg';

const clientID = process.env.CLIENT_ID;
const connectionString = process.env.DATABASE_URL?.split('?')[0];
if (!clientID || !connectionString) throw new Error('CLIENT_ID and DATABASE_URL are required.');

const client = new Client({ connectionString });
await client.connect();

try {
	const result = await client.query('UPDATE "clientStorage" SET shutdown = true WHERE id = $1', [clientID]);
	if (result.rowCount !== 1)
		throw new Error(`Expected one clientStorage row for ${clientID}, updated ${result.rowCount}.`);
	console.log(`Shutdown requested for ${clientID}.`);
} finally {
	await client.end();
}
