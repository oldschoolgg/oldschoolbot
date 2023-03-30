import '../src/index';

import { Collection } from 'discord.js';
import mitm from 'mitm';

global.globalClient = {
	emit: () => {},
	isReady: () => true,
	channels: { cache: new Collection() },
	guilds: { cache: new Collection(), channels: { cache: new Collection() } },
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

const mitmInstance = mitm();
mitmInstance.on('connect', () => {
	throw new Error('connect');
});
mitmInstance.on('connection', () => {
	throw new Error('connection');
});

mitmInstance.on('request', () => {
	throw new Error('request');
});
