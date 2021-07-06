import { Intents, Permissions } from 'discord.js';
import { KlasaClient, KlasaClientOptions, KlasaMessage, PermissionLevels } from 'klasa';

import { customClientOptions, production, providerConfig } from '../config';
import { PermissionLevelsEnum } from './constants';

export const clientOptions: KlasaClientOptions = {
	/* Discord.js Options */
	messageCacheMaxSize: 200,
	messageCacheLifetime: 120,
	messageSweepInterval: 120,
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
	permissionLevels: new PermissionLevels()
		.add(0, () => true)
		.add(
			PermissionLevelsEnum.Moderator,
			(message: KlasaMessage) =>
				message.member ? message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS) : false,
			{
				fetch: true
			}
		)
		.add(
			PermissionLevelsEnum.Admin,
			(message: KlasaMessage) =>
				message.member ? message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) : false,
			{
				fetch: true
			}
		)
		.add(9, (message: KlasaMessage) => message.client.owners.has(message.author), { break: true })
		.add(PermissionLevelsEnum.Owner, (message: KlasaMessage) => message.client.owners.has(message.author)),
	pieceDefaults: { commands: { deletable: true } },
	readyMessage: (client: KlasaClient) => `[Old School Bot] Ready to serve ${client.guilds.cache.size} guilds.`,
	partials: ['USER', 'CHANNEL'],
	production,
	...customClientOptions
};
