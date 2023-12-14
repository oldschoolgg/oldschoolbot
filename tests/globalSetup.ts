import '../src/index';
import '../src/lib/roboChimp';

import { Collection } from 'discord.js';
import { vi } from 'vitest';

vi.mock('@oldschoolgg/toolkit', async () => {
	const actualToolkit = await vi.importActual('@oldschoolgg/toolkit'); // Import all actual exports
	return {
		...actualToolkit, // Include all actual exports in the mock
		mentionCommand: vi.fn().mockReturnValue('') // Mock mentionCommand to return a blank string
	};
});

global.globalClient = {
	isReady: () => true,
	emit: () => true,
	guilds: { cache: new Collection() },
	mahojiClient: {
		commands: {
			values: [
				{
					name: 'test',
					description: 'test description',
					attributes: { description: 'test description' },
					options: []
				}
			]
		}
	},
	users: {
		cache: new Collection()
	},
	channels: {
		cache: new Collection()
	},
	busyCounterCache: new Map<string, number>()
} as any;
