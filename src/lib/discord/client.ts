import { writeFileSync } from 'node:fs';
import { omit } from 'remeda';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/cache.js';
import { Channel } from '@/lib/constants.js';
import { interactionHandler } from '@/lib/discord/interactionHandler.js';
import { OldSchoolBotClient } from '@/lib/discord/OldSchoolBotClient.js';
import { onMessage } from '@/lib/events.js';
import { onStartup } from '@/mahoji/lib/events.js';

const client = new OldSchoolBotClient();

declare global {
	var globalClient: OldSchoolBotClient;
}

global.globalClient = client;
client.on('messageCreate', msg => {
	onMessage(msg);
});

client.on('error', console.error);

client.on('interactionCreate', interaction => {
	writeFileSync(
		`./itx/itx-${Date.now()}.json`,
		JSON.stringify(omit(interaction, ['user', 'member', 'guild', 'channel']), null, 4)
	);

	return interactionHandler(interaction);
});

client.on('serverNotification', (message: string) => {
	globalClient.sendMessage(Channel.Notifications, {
		content: message,
		allowedMentions: { parse: [], users: [], roles: [] }
	});
});

client.on('economyLog', async (message: string) => {
	Logging.logDebug(message);
});

client.on('guildCreate', async guild => {
	if (BLACKLISTED_GUILDS.has(guild.id) || BLACKLISTED_USERS.has(guild.owner_id)) {
		await globalClient.leaveGuild(guild.id);
	}
});
client.on('shardDisconnect', (event, shardID) => Logging.logDebug(`Shard ${shardID} disconnected: ${event.code}}`));

client.on('ready', async _d => {
	await onStartup();
});
