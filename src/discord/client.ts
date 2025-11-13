import { ActivityType, GatewayIntentBits, PresenceUpdateStatus } from '@oldschoolgg/discord';

import { onRawGuildCreate } from '@/discord/handlers/guildCreate.js';
import { interactionHandler } from '@/discord/interactionHandler.js';
import { OldSchoolBotClient } from '@/discord/OldSchoolBotClient.js';
import { Channel, globalConfig } from '@/lib/constants.js';
import { onMessage } from '@/lib/events.js';
import { onStartup } from '@/mahoji/lib/events.js';

const client = new OldSchoolBotClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.GuildWebhooks
	],
	initialPresence: {
		activity: {
			name: 'Starting Up...',
			type: ActivityType.Listening
		},
		status: PresenceUpdateStatus.DoNotDisturb
	},
	token: globalConfig.botToken,
	isProduction: globalConfig.isProduction,
	mainServerId: globalConfig.supportServerID,
	userUsernameFetcher: async userId => Cache.getBadgedUsername(userId)
});

declare global {
	var globalClient: OldSchoolBotClient;
}

global.globalClient = client;
client.on('messageCreate', async msg => {
	try {
		const [isUserBlacklisted, isGuildBlacklisted] = await Promise.all([
			Cache.isUserBlacklisted(msg.author_id),
			msg.guild_id ? Cache.isGuildBlacklisted(msg.guild_id) : false
		]);
		if (isUserBlacklisted || isGuildBlacklisted) return;
	} catch (err) {
		Logging.logError(err as Error);
	}
	onMessage(msg);
});
client.on('error', console.error);

client.on('interactionCreate', async itx => {
	const guildId = itx.guild_id ?? null;
	const userId = (itx.member?.user.id ?? itx.user?.id)!;
	try {
		const [isUserBlacklisted, isGuildBlacklisted] = await Promise.all([
			Cache.isUserBlacklisted(userId),
			guildId ? Cache.isGuildBlacklisted(guildId) : false
		]);
		if (isUserBlacklisted || isGuildBlacklisted) return;
	} catch (err) {
		Logging.logError(err as Error);
	}
	return interactionHandler(client, itx);
});

client.on('serverNotification', async (message: string) => {
	await globalClient.sendMessage(Channel.Notifications, {
		content: message,
		allowedMentions: { parse: [], users: [], roles: [] }
	});
});

client.on('economyLog', async (message: string) => {
	Logging.logDebug(message);
});

client.on('guildCreate', onRawGuildCreate);
client.on('guildCreate', async guild => {
	const [isUserBlacklisted, isGuildBlacklisted] = await Promise.all([
		Cache.isUserBlacklisted(guild.owner_id),
		Cache.isGuildBlacklisted(guild.id)
	]);
	if (isUserBlacklisted || isGuildBlacklisted) {
		await globalClient.leaveGuild(guild.id);
	}
});

client.on('ready', async _d => {
	globalClient.setPresence({
		text: '/help',
		type: ActivityType.Listening,
		status: PresenceUpdateStatus.Online
	});
	await onStartup();
});
