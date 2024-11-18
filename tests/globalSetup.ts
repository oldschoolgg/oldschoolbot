import '../src/lib/safeglobals';

import { Collection } from 'discord.js';
import { vi } from 'vitest';

vi.mock('@oldschoolgg/toolkit', async () => {
	const actual: any = await vi.importActual('@oldschoolgg/toolkit');
	return {
		...actual,
		mentionCommand: async (_args: any) => 'hi'
	};
});

vi.mock('../node_modules/@oldschoolgg/toolkit/src/util/discord.ts', async () => {
	const actualToolkit = await vi.importActual('../node_modules/@oldschoolgg/toolkit/src/util/discord.ts');
	return {
		...actualToolkit,
		mentionCommand: vi.fn().mockReturnValue('')
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
		cache: new Collection().set('1', { id: '1' })
	},
	busyCounterCache: new Map<string, number>()
} as any;

if (!process.env.TEST) {
	throw new Error('This file should only be imported in tests.');
}
