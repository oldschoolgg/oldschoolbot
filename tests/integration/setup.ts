import '../globalSetup';

import { vi } from 'vitest';

vi.mock('../../src/lib/util/handleMahojiConfirmation', () => ({
	handleMahojiConfirmation: vi.fn()
}));

vi.mock('../../src/lib/util/interactionReply', () => ({
	deferInteraction: vi.fn()
}));

const originalRandom = Math.random;

export function restoreMathRandom() {
	Math.random = originalRandom;
}
export function randomMock(random = 0.1) {
	Math.random = () => random;
}

vi.mock('../../src/lib/util/webhook', async () => {
	const actual: any = await vi.importActual('../../src/lib/util/webhook');
	return {
		...actual,
		sendToChannelID: async (args: any) => {}
	};
});

// @ts-ignore mock
globalClient.fetchUser = async () => ({
	send: async () => {}
});
