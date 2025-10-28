import '../../src/lib/safeglobals.js';

import { Collection } from 'discord.js';
import { vi } from 'vitest';

import { createDb } from '@/lib/globals.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';
import { mockChannel, TEST_CHANNEL_ID } from './util.js';

await createDb();

global.globalClient = {
	isReady: () => true,
	emit: () => true,
	guilds: { cache: new Collection() },
	users: {
		cache: new Collection(),
		fetch: async (id: string) => Promise.resolve(globalClient.users.cache.get(id))
	},
	channels: {
		cache: new Collection().set(TEST_CHANNEL_ID, mockChannel({ userId: '123' }))
	},
	busyCounterCache: new Map<string, number>(),
	allCommands: allCommandsDONTIMPORT
} as any;

vi.mock('@oldschoolgg/toolkit', async () => {
	const actualToolkit = await vi.importActual('@oldschoolgg/toolkit');
	return {
		...actualToolkit,
		channelIsSendable: vi.fn().mockReturnValue(true)
		// awaitMessageComponentInteraction: vi.fn().mockImplementation(({ message }: { message: Message }) => {
		// 	return Promise.resolve({
		// 		customId: randArrItem(Object.values(InteractionID.Slayer)),
		// 		...mockInteraction({ user: { id: message.author.id } as any })
		// 	});
		// })
	};
});

vi.mock('../../src/lib/util/webhook', async () => {
	const actual: any = await vi.importActual('../../src/lib/util/webhook');
	return {
		...actual,
		sendToChannelID: vi.fn(() => {
			return Promise.resolve();
		})
	};
});
