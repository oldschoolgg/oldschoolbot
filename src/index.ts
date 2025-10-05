import './lib/constants.js';
import './lib/safeglobals.js';

import { createDb } from './lib/globals.js';
import './lib/MUser.js';
import './lib/discord/client.js';

import { init } from '@sentry/node';
import exitHook from 'exit-hook';

import { gitHash, globalConfig } from '@/lib/constants.js';
import { allCollectionLogsFlat } from '@/lib/data/Collections.js';
import { preStartup } from '@/lib/preStartup.js';
import { fetchCLLeaderboard } from '@/lib/util/clLeaderboard.js';
import { exitCleanup } from '@/mahoji/lib/exitHandler.js';

exitHook(exitCleanup);

if (globalConfig.sentryDSN) {
	init({
		dsn: globalConfig.sentryDSN,
		defaultIntegrations: false,
		integrations: [],
		release: gitHash
	});
}

async function main() {
	await createDb();
	Logging.logDebug(`Starting up after ${process.uptime()}s`);

	await Promise.all([preStartup(), globalClient.login(globalConfig.botToken)]);

	Logging.logDebug(`Logged in as ${globalClient.user.username} after ${process.uptime()}s`);
	// 	console.log(await prisma.$queryRawUnsafe(`SELECT * FROM users
	// WHERE "minion.equippedPet"::text::integer = ANY(ARRAY[5]);`));
	// 	console.log(await prisma.$queryRawUnsafe(`SELECT * FROM users
	// WHERE "minion.equippedPet"::text::integer @> ARRAY[5];`));
	const cl = allCollectionLogsFlat[0];
	console.log(
		await fetchCLLeaderboard({
			ironmenOnly: false,
			items: cl.items,
			resultLimit: 10,
			clName: cl.name
		})
	);
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
