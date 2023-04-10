import '../src/index';
import '../src/lib/roboChimp';

import { Collection } from 'discord.js';

global.globalClient = {
	isReady: () => true,
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
	}
} as any;
