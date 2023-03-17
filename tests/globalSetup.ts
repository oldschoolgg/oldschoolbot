import '../src/lib/customItems/customItems';
import '../src/lib/data/itemAliases';
import '../src/lib/util/logger';
import '../src/lib/MUser';

global.globalClient = {
	isReady: () => true,
	guilds: { cache: new Map() },
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
