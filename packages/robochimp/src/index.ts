import './lib/prisma';
import './lib/client';
import { globalConfig } from './constants.js';
import { startServer } from './http/server.js';
import { runStartupScripts } from './lib/startupScripts.js';

async function main() {
	await startServer();
	await runStartupScripts();
	await djsClient.login(globalConfig.botToken);
	console.log(`${djsClient.user!.username} logged in`);
}

main();
