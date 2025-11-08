import { writeFileSync } from 'node:fs';
import { ActivityType, GatewayIntentBits, PresenceUpdateStatus } from '@oldschoolgg/discord';
import { omit } from 'remeda';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/cache.js';
import { Channel, globalConfig } from '@/lib/constants.js';
import { onRawGuildCreate } from '@/lib/discord/handlers/guildCreate.js';
import { interactionHandler } from '@/lib/discord/interactionHandler.js';
import { OldSchoolBotClient } from '@/lib/discord/OldSchoolBotClient.js';
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
	mainServerId: globalConfig.supportServerID
});

declare global {
	var globalClient: OldSchoolBotClient;
}

global.globalClient = client;
client.on('messageCreate', msg => {
	onMessage(msg);
});
client.on('error', console.error);

client.on('interactionCreate', interaction => {
	// TODO: remove this
	writeFileSync(
		`./itx/itx-${Date.now()}.json`,
		JSON.stringify(omit(interaction, ['user', 'member', 'guild', 'channel']), null, 4)
	);

	return interactionHandler(interaction);
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
	if (BLACKLISTED_GUILDS.has(guild.id) || BLACKLISTED_USERS.has(guild.owner_id)) {
		await globalClient.leaveGuild(guild.id);
	}
});

client.on('ready', async _d => {
	await onStartup();
});
