import { TimerManager } from '@sapphire/timer-manager';

import { updateTestBotStatus } from './events';

export async function exitCleanup() {
	try {
		globalClient.isShuttingDown = true;
		console.log('Cleaning up and exiting...');
		TimerManager.destroy();
		await updateTestBotStatus(false);
		await Promise.all([
			globalClient.destroy(),
			prisma.$disconnect(),
			redis.disconnect(),
			roboChimpClient.$disconnect()
		]);
		console.log('\nCleaned up and exited.');
	} catch (err) {
		console.error(err);
	}
}
