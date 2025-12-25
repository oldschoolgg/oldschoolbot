import './lib/safeglobals.js';
import './lib/MUser.js';
import './discord/client.js';
import './lib/cache/redis.js';

import exitHook from 'exit-hook';

import { createDb } from '@/lib/globals.js';
import { preStartup } from '@/lib/preStartup.js';
import { exitCleanup } from '@/mahoji/lib/exitHandler.js';

exitHook(exitCleanup);

async function main() {
	await createDb();
	Logging.logDebug(`Starting up after ${process.uptime()}s`);
	await Promise.all([preStartup(), globalClient.login()]);
	// intentional type error
	Logging.logError(1);
}

process.on('uncaughtException', err => {
	console.error(err);
	Logging.logError(err);
});

process.on('unhandledRejection', err => {
	console.error(err);
	Logging.logError(err as Error);
});

main();
