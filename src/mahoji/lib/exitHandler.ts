import { TimerManager } from '@sapphire/timer-manager';

import { crons } from '@/lib/crons.js';
import { sonicBoom } from '@/lib/util/logger.js';

export async function exitCleanup() {
	try {
		globalClient.isShuttingDown = true;
		console.log('Cleaning up and exiting...');
		TimerManager.destroy();

		sonicBoom.flushSync();
		sonicBoom.destroy();
		await globalClient.destroy();
		for (const cron of crons) cron.stop();

		console.log('\nCleaned up and exited.');
	} catch (err) {
		console.error(err);
	}
}
