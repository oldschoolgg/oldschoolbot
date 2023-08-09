import '../src/index';
import '../src/lib/roboChimp';

import { Collection } from 'discord.js';

import { MUserStats } from '../src/lib/structures/MUserStats';

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
	}
} as any;

// @ts-ignore mock
MUserStats.fromID = async () => {
	return new MUserStats({
		user_id: ''
	} as any);
};
