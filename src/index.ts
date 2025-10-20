import './lib/safeglobals.js';
import './lib/MUser.js';
import './lib/discord/client.js';

import exitHook from 'exit-hook';

import { globalConfig } from '@/lib/constants.js';
import { createDb } from '@/lib/globals.js';
import { preStartup } from '@/lib/preStartup.js';
import { massMigrateToTableBanks } from '@/lib/table-banks/massTableBankMigration.js';
import { exitCleanup } from '@/mahoji/lib/exitHandler.js';

exitHook(exitCleanup);

async function main() {
	await createDb();
	Logging.logDebug('Starting table bank migration...');
	await massMigrateToTableBanks();
	Logging.logDebug('Table bank migration complete.');
	Logging.logDebug(`Starting up after ${process.uptime()}s`);
	await Promise.all([preStartup(), globalClient.login(globalConfig.botToken)]);
	Logging.logDebug(`Logged in as ${globalClient.user.username} after ${process.uptime()}s`);
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
