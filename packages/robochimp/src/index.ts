import { syncBlacklists } from '@/lib/syncBlacklists.js';
import './discord/client.js';

import { startServer } from './http/server.js';
import { initPrismaClients } from './lib/prisma.js';

process.on('uncaughtException', err => {
	console.error(err);
});

process.on('unhandledRejection', err => {
	console.error(err);
});

async function main() {
	await initPrismaClients();
	await startServer();
	// await globalClient.login();
	await syncBlacklists();
}

main();
