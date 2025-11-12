import { TimerManager } from '@sapphire/timer-manager';

import { sonicBoom } from '@/lib/util/logger.js';

export async function exitCleanup() {
	try {
		if (typeof globalThis.globalClient !== 'undefined') {
			globalClient.isShuttingDown = true;
		}
		TimerManager.destroy();

		sonicBoom.flushSync();
		sonicBoom.destroy();
		if (prisma) {
			prisma.$disconnect();
		}
		if (roboChimpClient) {
			roboChimpClient.$disconnect();
		}
	} catch (err) {
		console.error(err);
	}
}
