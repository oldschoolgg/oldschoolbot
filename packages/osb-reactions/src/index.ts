import './discord/client.js';

import { globalConfig } from '@/constants.js';
import { initPrismaClients } from './lib/prisma.js';

process.on('uncaughtException', err => {
	console.error(err);
});

process.on('unhandledRejection', err => {
	console.error(err);
});

async function main() {
	await initPrismaClients();
	if (globalConfig.isProduction) {
		await globalClient.login();
	}
}

main();
