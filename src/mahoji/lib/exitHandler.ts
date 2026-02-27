import { TimerManager } from '@sapphire/timer-manager';

import { sonicBoom } from '@/lib/util/logger.js';

export async function exitCleanup() {
	try {
		if (typeof globalThis.globalClient !== 'undefined') {
			globalClient.ws.destroy();
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
		Logging.logError(err as Error);
	}
}
