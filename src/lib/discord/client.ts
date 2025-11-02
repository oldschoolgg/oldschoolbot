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

// TODO
// client.on('guildCreate', guild => {
// 	if (BLACKLISTED_GUILDS.has(guild.id) || BLACKLISTED_USERS.has(guild.ownerId)) {
// 		guild.leave();
// 	}
// });
client.on('shardDisconnect', (event, shardID) => Logging.logDebug(`Shard ${shardID} disconnected: ${event.code}}`));

client.on('ready', async _d => {
	// TODO
	// const ownerId = e.application.owner?.id;
	// if (ownerId && !globalConfig.adminUserIDs.includes(ownerId)) {
	// 	globalConfig.adminUserIDs.push(ownerId);
	// }
	// e.application.commands.fetch({
	// 	guildId: globalConfig.isProduction ? undefined : globalConfig.supportServerID
	// });
	await onStartup();
});
