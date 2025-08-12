import '../globalSetup';
import '../../src/lib/globals';
import '../../src/lib/util/transactItemsFromBank';
import '../../src/lib/ActivityManager';
import './mocks';

import { beforeEach, vi } from 'vitest';

import { PrismaClient } from '@prisma/client';
import { noOp } from 'e';

if (!roboChimpClient) {
	throw new Error('Robochimp client not found.');
}

export function randomMock(random = 0.1) {
	Math.random = () => random;
}

vi.mock('../../src/lib/util/webhook', async () => {
	const actual: any = await vi.importActual('../../src/lib/util/webhook');
	return {
		...actual,
		sendToChannelID: vi.fn(() => {
			// console.log('sendToChannelID called with args:', args);
			return Promise.resolve();
		})
	};
});

// @ts-ignore mock
globalClient.fetchUser = async (id: string | bigint) => ({
	id: typeof id === 'string' ? id : String(id),
	send: async () => {}
});

const __prismaClient = new PrismaClient();
__prismaClient.$queryRawUnsafe('CREATE EXTENSION IF NOT EXISTS intarray;').then(noOp).catch(noOp);

beforeEach(async () => {
	global.prisma = __prismaClient;
});
