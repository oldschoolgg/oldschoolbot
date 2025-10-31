import {
	ActivityType,
	Events as DJSEvent,
	GatewayIntentBits,
	Partials,
	PresenceUpdateStatus
} from '@oldschoolgg/discord';
import { Events } from '@oldschoolgg/toolkit';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { Channel, globalConfig } from '@/lib/constants.js';
import { onRawGuildCreate } from '@/lib/discord/handlers/guildCreate.js';
import { interactionHandler } from '@/lib/discord/interactionHandler.js';
import { onMessage } from '@/lib/events.js';
import { OldSchoolBotClient } from '@/lib/structures/OldSchoolBotClient.js';
import { onStartup } from '@/mahoji/lib/events.js';

const client = new OldSchoolBotClient({
	// shards: 'auto',
	ws: {
		initialPresence: {
			since: Date.now() - process.uptime() * 1000,
			activities: [
				{
					name: 'Starting Up...',
					type: ActivityType.Listening
				}
			],
			status: PresenceUpdateStatus.DoNotDisturb,
			afk: false
		}
	},
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.GuildWebhooks
	],
	partials: [Partials.User, Partials.Channel],
	allowedMentions: {
		parse: ['users']
	}
});

declare global {
	var globalClient: OldSchoolBotClient;
}

global.globalClient = client;
client.on(DJSEvent.MessageCreate, msg => {
	onMessage(msg);
});
client.on('raw', (d: any) => {
	if (d.t === 'GUILD_CREATE') {
		onRawGuildCreate(d.d);
	}
});
client.on(DJSEvent.Error, console.error);

client.on(DJSEvent.InteractionCreate, interaction => {
	return interactionHandler(interaction);
});

client.on(Events.ServerNotification, (message: string) => {
	globalClient.sendMessage(Channel.Notifications, {
		content: message,
		allowedMentions: { parse: [], users: [], roles: [] }
	});
});

client.on(Events.EconomyLog, async (message: string) => {
	Logging.logDebug(message);
});
client.on(DJSEvent.GuildCreate, guild => {
	if (!guild.available) return;
	if (BLACKLISTED_GUILDS.has(guild.id) || BLACKLISTED_USERS.has(guild.ownerId)) {
		guild.leave();
	}
});
client.on('shardDisconnect', (event, shardID) => Logging.logDebug(`Shard ${shardID} disconnected: ${event.code}}`));
client.on(DJSEvent.CacheSweep, e => {
	Logging.logDebug(`Cache Sweep: ${e}`);
});
client.on(DJSEvent.Warn, e => Logging.logDebug(e));
client.on('shardError', err => Logging.logDebug('Shard Error', { error: err.message }));
client.on(DJSEvent.ClientReady, async e => {
	const ownerId = e.application.owner?.id;
	if (ownerId && !globalConfig.adminUserIDs.includes(ownerId)) {
		globalConfig.adminUserIDs.push(ownerId);
	}
	e.application.commands.fetch({
		guildId: globalConfig.isProduction ? undefined : globalConfig.supportServerID
	});
	await onStartup();
});
// client.on(DJSEvent.Debug, e => Logging.logDebug(e));
