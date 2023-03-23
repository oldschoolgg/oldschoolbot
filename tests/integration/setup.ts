import '../globalSetup';

import { vi } from 'vitest';

vi.mock('../../src/lib/util/handleMahojiConfirmation', () => ({
	handleMahojiConfirmation: vi.fn()
}));

export function randomMock(random = 0.1) {
	Math.random = () => random;
}

vi.mock('../../src/lib/util/webhook', async () => {
	const actual: any = await vi.importActual('../../src/lib/util/webhook');
	return {
		...actual,
		sendToChannelID: async (args: any) => {
			console.log(`Sending ${args}`);
		}
	};
});

vi.mock('../../src/lib/roboChimp.ts', async () => {
	const actual: any = await vi.importActual('../../src/lib/roboChimp');
	return {
		...actual,
		roboChimpUserFetch: () => ({
			leagues_points_total: 1000,
			leagues_points_balance_osb: 1,
			leagues_points_balance_bso: 1,
			leagues_completed_tasks_ids: []
		})
	};
});

vi.mock('../../src/lib/leagues/stats', async () => {
	const actual: any = await vi.importActual('../../src/lib/leagues/stats');
	return {
		...actual,
		calcLeaguesRanking: async () => ({
			pointsRanking: 1,
			tasksRanking: 1
		})
	};
});
