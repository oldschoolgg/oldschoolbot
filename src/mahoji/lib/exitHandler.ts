import { TimerManager } from '@sapphire/timer-manager';

import { globalConfig } from '@/lib/constants.js';
import { crons } from '@/lib/crons.js';
import { sql } from '@/lib/postgres.js';
import { sonicBoom } from '@/lib/util/logger.js';
import { clearApplicationCommands } from '@/mahoji/commands/sync/installGracefulShutdown.js';

export async function exitCleanup() {
	try {
		globalClient.isShuttingDown = true;
		console.log('Cleaning up and exiting...');
		TimerManager.destroy();

		sonicBoom.flushSync();
		sonicBoom.destroy();

		if (globalClient.token) {
			await clearApplicationCommands({
				rest: globalClient.rest,
				clientId: globalConfig.clientID,
				supportGuildId: globalConfig.supportServerID,
				isProduction: globalConfig.isProduction
			});
		}

		await Promise.all([globalClient.destroy(), sql.end()]);
		for (const cron of crons) cron.stop();

		console.log('\nCleaned up and exited.');
	} catch (err) {
		console.error(err);
	}
}
