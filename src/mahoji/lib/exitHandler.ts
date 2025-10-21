import { TimerManager } from '@sapphire/timer-manager';

import { crons } from '@/lib/crons.js';
import { sonicBoom } from '@/lib/util/logger.js';

export async function exitCleanup() {
	try {
		console.log('Cleaning up and exiting...');

		if (typeof globalThis.globalClient !== 'undefined') {
			globalClient.isShuttingDown = true;
		}
		TimerManager.destroy();

		sonicBoom.flushSync();
		sonicBoom.destroy();
		for (const cron of crons) cron.stop();
		if (prisma) {
			prisma.$disconnect();
		}
		if (roboChimpClient) {
			roboChimpClient.$disconnect();
		}

		console.log('\nCleaned up and exited.');
	} catch (err) {
		console.error(err);
	}
}
