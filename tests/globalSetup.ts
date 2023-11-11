import '../src/index';
import '../src/lib/roboChimp';

import { Collection } from 'discord.js';

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
