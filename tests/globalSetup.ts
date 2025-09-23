import { randArrItem } from '@oldschoolgg/toolkit';
import { Collection, type Message } from 'discord.js';
import { vi } from 'vitest';

import '../src/lib/safeglobals.js';

import { InteractionID } from '@/lib/InteractionID.js';
import { mockChannel, mockInteraction, TEST_CHANNEL_ID } from './integration/util.js';

vi.mock('@oldschoolgg/toolkit/discord-util', async () => {
	const actualToolkit = await vi.importActual('@oldschoolgg/toolkit/discord-util');
	return {
		...actualToolkit,
		channelIsSendable: vi.fn().mockReturnValue(true),
		awaitMessageComponentInteraction: vi.fn().mockImplementation(({ message }: { message: Message }) => {
			return Promise.resolve({
				customId: randArrItem(Object.values(InteractionID.Slayer)),
				...mockInteraction({ userId: message.author.id })
			});
		}),
		mentionCommand: vi.fn().mockReturnValue('true'),
		makePaginatedMessage: vi.fn(() => {
			return Promise.resolve();
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
		cache: new Collection()
	},
	channels: {
		cache: new Collection().set(TEST_CHANNEL_ID, mockChannel({ userId: '123' }))
	},
	busyCounterCache: new Map<string, number>()
} as any;

if (!process.env.TEST) {
	throw new Error('This file should only be imported in tests.');
}
