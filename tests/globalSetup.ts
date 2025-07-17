import { InteractionID } from '@/lib/InteractionID';
import '../src/lib/safeglobals';
import { Collection, type Message } from 'discord.js';
import { randArrItem } from 'e';
import { vi } from 'vitest';
import { TEST_CHANNEL_ID, mockChannel, mockInteraction } from './integration/util';

vi.mock('@oldschoolgg/toolkit', async () => {
	const actual: any = await vi.importActual('@oldschoolgg/toolkit');
	return {
		...actual,
		mentionCommand: async (_args: any) => 'hi'
	};
});

vi.mock('@oldschoolgg/toolkit/util', async () => {
	const actualToolkit = await vi.importActual('@oldschoolgg/toolkit/util');
	return {
		...actualToolkit,
		channelIsSendable: vi.fn().mockReturnValue(true),
		awaitMessageComponentInteraction: vi.fn().mockImplementation(({ message }: { message: Message }) => {
			return Promise.resolve({
				customId: randArrItem(Object.values(InteractionID.Slayer)),
				...mockInteraction({ userId: message.author.id })
			});
		}),
		mentionCommand: vi.fn().mockReturnValue('true')
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
