import '../src/index';

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
