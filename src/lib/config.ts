import { Intents } from 'discord.js';
import { Time } from 'e';
import { KlasaClient, KlasaClientOptions } from 'klasa';

import { customClientOptions, production, providerConfig } from '../config';
import { formatDuration } from './util';

export const clientOptions: KlasaClientOptions = {
	/* Discord.js Options */
	messageCacheMaxSize: 200,
	messageCacheLifetime: 120,
	messageSweepInterval: 5000,
	owners: ['157797566833098752'],
	shards: 'auto',
	http: {
		api: 'https://discord.com/api'
	},
	intents: new Intents([
		'GUILDS',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS',
		'GUILD_WEBHOOKS'
	]),
	/* Klasa Options */
	prefix: '=',
	providers: providerConfig ?? undefined,
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) => {
		const deprecatedCommands = client.commands.filter(c => c.path.toLowerCase().includes('deprecated')).size;
		const totalCmds = client.commands.size;
		const commandsLeft = totalCmds - deprecatedCommands;
		const endOfTheWorld = new Date('2022-08-14');
		const diff = endOfTheWorld.getTime() - Date.now();
		const daysUntil = diff / Time.Day;
		const migrationStr = `There are ${
			totalCmds - deprecatedCommands
		} commands left (${deprecatedCommands} deprecated) to become Slash Commands within ${formatDuration(diff)
			.split(' ')
			.slice(0, 2)
			.join(' ')
			.replace(',', '')} (${(commandsLeft / daysUntil).toFixed(2)} per day)`;
		return `[BSO] Ready to serve ${client.guilds.cache.size} guilds. ${migrationStr}. There are ${globalClient.mahojiClient.commands.pieces.size} mahoji commands.`;
	},
	partials: ['USER', 'CHANNEL'],
	production,
	...customClientOptions,
	allowedMentions: {
		parse: ['roles', 'users']
	}
};
