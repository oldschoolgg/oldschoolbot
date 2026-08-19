import { ActivityType, GatewayIntentBits, PresenceUpdateStatus } from '@oldschoolgg/discord';

import { allCommands } from '@/commands/allCommands.js';
import { globalConfig } from '@/constants.js';
import { interactionHandler } from '@/discord/interactionHandler.js';
import { OSBReactionsBotClient } from '@/discord/OSBReactionsBotClient.js';
import { bulkUpdateCommands } from '@/discord/utils.js';
import { handleMessageCreate } from '@/events/messageCreate.js';
import { userReactsHandler } from '@/events/messageCreate/userReactsHandler.js';

console.log(`Preparing OSB Reactions client... token ${globalConfig.botToken.slice(0, 5)}...`);
const client = new OSBReactionsBotClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
	initialPresence: {
		activity: {
			name: 'replies and mentions',
			type: ActivityType.Listening
		},
		status: PresenceUpdateStatus.DoNotDisturb
	},
	token: globalConfig.botToken,
	isProduction: globalConfig.isProduction,
	mainServerId: globalConfig.supportServerID,
	userUsernameFetcher: async () => 'Unknown'
});

export type OSBReactionsClientClass = typeof client;

global.globalClient = client;
globalClient.on('error', console.error);

globalClient.on('messageCreate', handleMessageCreate);
globalClient.on('rawMessageCreate', userReactsHandler);

globalClient.on('interactionCreate', itx => {
	return interactionHandler(client, itx);
});

globalClient.on('ready', async () => {
	globalClient.setPresence({
		text: 'replies and mentions',
		type: ActivityType.Listening,
		status: PresenceUpdateStatus.Online
	});
	globalClient.allCommands = allCommands;
	await bulkUpdateCommands();
});
