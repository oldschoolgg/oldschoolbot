import { randArrItem } from '@oldschoolgg/rng';
import { Collection, type Message } from 'discord.js';
import { vi } from 'vitest';

import '../src/lib/safeglobals.js';

import { InteractionID } from '@/lib/InteractionID.js';
import { mockChannel, mockInteraction, TEST_CHANNEL_ID } from './integration/util.js';

vi.mock('@oldschoolgg/toolkit', async () => {
	const actualToolkit = await vi.importActual('@oldschoolgg/toolkit');
	return {
		...actualToolkit,
		channelIsSendable: vi.fn().mockReturnValue(true),
		awaitMessageComponentInteraction: vi.fn().mockImplementation(({ message }: { message: Message }) => {
			return Promise.resolve({
				customId: randArrItem(Object.values(InteractionID.Slayer)),
				...mockInteraction({ userId: message.author.id })
			});
		})
	};
});

global.globalClient = {
	isReady: () => true,
	emit: () => true,
	guilds: { cache: new Collection() },
	mahojiClient: {
		commands: {
			values: () =>
				['test'].map(n => ({
					name: n,
					description: 'test description',
					attributes: { description: 'test description' },
					options: [{ name: 'claim' }]
				}))
		}
	},
	users: {
		cache: new Collection(),
		fetch: async (id: string) => Promise.resolve(globalClient.users.cache.get(id))
	},
	channels: {
		cache: new Collection().set(TEST_CHANNEL_ID, mockChannel({ userId: '123' }))
	},
	busyCounterCache: new Map<string, number>()
} as any;

vi.mock('../src/lib/workers/index.ts', async () => {
	return {
		Workers: {
			casketOpen: () => Promise.resolve(),
			kill: () => Promise.resolve(),
			finish: () => Promise.resolve()
		}
	};
});
