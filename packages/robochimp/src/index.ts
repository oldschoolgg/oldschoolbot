import './discord/client.js';

import { globalConfig } from './constants.js';
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
	await globalClient.login(globalConfig.botToken);

	console.log(
		`${globalClient.user!.username} logged in ${globalConfig.isProduction ? '[Production]' : '[Development]'} [Node${process.version}] after ${process.uptime()}s`
	);
}

main();
