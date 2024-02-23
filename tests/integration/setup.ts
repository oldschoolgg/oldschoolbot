import '../globalSetup';

import { beforeAll, beforeEach, vi } from 'vitest';

import { prisma } from '../../src/lib/settings/prisma';

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

// @ts-ignore mock
globalClient.fetchUser = async (id: string | bigint) => ({
	id: typeof id === 'string' ? id : String(id),
	send: async () => {}
});

beforeAll(async () => {
	console.log(
		await prisma.$queryRawUnsafe(`SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND pid <> pg_backend_pid();`)
	);
});

beforeEach(async () => {
	console.log(await prisma.$queryRawUnsafe('SELECT COUNT(*) FROM pg_stat_activity;'));
});
