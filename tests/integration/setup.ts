import '../globalSetup.js';
import '../../src/lib/globals.js';
import '../../src/lib/util/transactItemsFromBank.js';
import '../../src/lib/ActivityManager.js';

import { noOp } from '@oldschoolgg/toolkit';
import { PrismaClient } from '@prisma/client';
import { beforeEach, vi } from 'vitest';

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

const __prismaClient = new PrismaClient();
__prismaClient.$queryRawUnsafe('CREATE EXTENSION IF NOT EXISTS intarray;').then(noOp).catch(noOp);

beforeEach(async () => {
	global.prisma = __prismaClient;
});
