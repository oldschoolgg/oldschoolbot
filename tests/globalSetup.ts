import '../src/index';
import '../src/lib/roboChimp';

import { Collection } from 'discord.js';
import { vi } from 'vitest';

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
	},
	users: {
		cache: new Collection()
	},
	emojis: {
		cache: new Collection()
	},
	channels: {
		cache: {
			get: () => {
				return {
					send: () => {
						return {
							delete: vi.fn(),
							edit: vi.fn(),
							catch: vi.fn()
						};
					},
					isTextBased: () => true
				};
			}
		}
	}
} as any;

vi.mock('e', async () => {
	const actual: any = await vi.importActual('e');
	return {
		...actual,
		sleep: vi.fn()
	};
});
