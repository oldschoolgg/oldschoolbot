import '../globalSetup';

import { vi } from 'vitest';

vi.mock('../../src/lib/util/handleMahojiConfirmation', () => ({
	handleMahojiConfirmation: vi.fn()
}));
vi.mock('../../src/lib/util/interactionReply', () => ({
	deferInteraction: vi.fn()
}));

export function randomMock(random = 0.1) {
	Math.random = () => random;
}

vi.mock('../../src/lib/util/webhook', async () => {
	const actual: any = await vi.importActual('../../src/lib/util/webhook');
	return {
		...actual,
		sendToChannelID: async (_args: any) => {}
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

// @ts-ignore mock
globalClient.fetchUser = async (id: string | bigint) => ({
	id: typeof id === 'string' ? id : String(id),
	send: async () => {}
});
