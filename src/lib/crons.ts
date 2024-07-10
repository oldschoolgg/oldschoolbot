import { schedule } from 'node-cron';

import { syncPrescence } from './doubleLoot';
import { syncSlayerMaskLeaderboardCache } from './util/slayerMaskLeaderboard';

export function initCrons() {
	schedule('0 * * * *', () => {
		debugLog('Set Activity cronjob starting');
		syncPrescence();
	});

	schedule('0 0 * * *', async () => {
		syncSlayerMaskLeaderboardCache();
	});
}
