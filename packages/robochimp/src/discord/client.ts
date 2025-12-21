import { ActivityType, GatewayIntentBits, PresenceUpdateStatus } from '@oldschoolgg/discord';

import { interactionHandler } from '@/discord/interactionHandler.js';
import { RoboChimpBotClient } from '@/discord/RoboChimpBotClient.js';
import { bulkUpdateCommands } from '@/discord/utils.js';
import { globalConfig } from '@/constants.js';
import { pointsHandler } from '@/events/messageCreate/pointsHandler.js';
import { userReactsHandler } from '@/events/messageCreate/userReactsHandler.js';
import { handleMessageCreate } from '@/events/messageCreate.js';

const client = new RoboChimpBotClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.MessageContent
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
	userUsernameFetcher: async () => 'TODO'
});

declare global {
	var globalClient: RoboChimpBotClient;
}

global.globalClient = client;
globalClient.on('error', console.error);

globalClient.on('messageCreate', handleMessageCreate);
globalClient.on('rawMessageCreate', m => {
	pointsHandler(m);
	userReactsHandler(m);
});

globalClient.on('interactionCreate', itx => {
	return interactionHandler(client, itx);
});

globalClient.on('ready', async () => {
	globalClient.setPresence({
		text: 'Ook Ook',
		type: ActivityType.Listening,
		status: PresenceUpdateStatus.Online
	});
	await bulkUpdateCommands();
});
