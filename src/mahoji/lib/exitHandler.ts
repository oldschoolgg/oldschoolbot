import { TimerManager } from '@sapphire/timer-manager';

export async function exitCleanup() {
	try {
		globalClient.isShuttingDown = true;
		console.log('Cleaning up and exiting...');
		TimerManager.destroy();
		await Promise.all([globalClient.destroy(), prisma.$disconnect(), roboChimpClient.$disconnect()]);
		console.log('\nCleaned up and exited.');
	} catch (err) {
		console.error(err);
	}
}
