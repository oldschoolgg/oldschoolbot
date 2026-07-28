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
		if (typeof globalThis.prisma !== 'undefined') {
			prisma.$disconnect();
		}
		if (typeof globalThis.roboChimpClient !== 'undefined') {
			roboChimpClient.$disconnect();
		}
		if (typeof globalThis.Cache !== 'undefined') {
			await Cache.close();
		}
	} catch (err) {
		Logging.logError(err as Error);
	}
}
