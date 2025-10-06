import './lib/prisma.js';
import './discord/client.js';

import { globalConfig } from './constants.js';
import { startServer } from './http/server.js';

async function main() {
	await startServer();
	await globalClient.login(globalConfig.botToken);
	console.log(`${globalClient.user!.username} logged in`);
}

main();
