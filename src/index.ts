import './lib/customItems/customItems';
import './lib/data/itemAliases';
import './lib/crons';
import './lib/MUser';
import './lib/util/transactItemsFromBank';
import './lib/data/trophies';
import './lib/itemMods';
import './lib/geImage';

import { MahojiClient } from '@oldschoolgg/toolkit';
import { init } from '@sentry/node';
import type { TextChannel } from 'discord.js';
import { GatewayIntentBits, Options, Partials } from 'discord.js';
import { isObject } from 'e';

import { DEV_SERVER_ID, SENTRY_DSN, SupportServer, botToken } from './config';
import { syncActivityCache } from './lib/Task';
import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from './lib/blacklists';
import { Channel, Events, META_CONSTANTS, gitHash, globalConfig } from './lib/constants';
import { economyLog } from './lib/economyLogs';
import { onMessage } from './lib/events';
import { modalInteractionHook } from './lib/modals';
import { runStartupScripts } from './lib/startupScripts';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';
import { assert, runTimedLoggedFn } from './lib/util';
import { CACHED_ACTIVE_USER_IDS, syncActiveUserIDs } from './lib/util/cachedUserIDs';
import { interactionHook } from './lib/util/globalInteractions';
import { handleInteractionError } from './lib/util/interactionReply';
import { logError } from './lib/util/logError';
import { allCommands } from './mahoji/commands/allCommands';
import { onStartup } from './mahoji/lib/events';
import { postCommand } from './mahoji/lib/postCommand';
import { preCommand } from './mahoji/lib/preCommand';
import { convertMahojiCommandToAbstractCommand } from './mahoji/lib/util';

debugLog(`Starting... Git Hash ${META_CONSTANTS.GIT_HASH}`);

if (SENTRY_DSN) {
	init({
		dsn: SENTRY_DSN,
		enableTracing: false,
		defaultIntegrations: false,
		integrations: [],
		release: gitHash
	});
}

assert(process.env.TZ === 'UTC');

const client = new OldSchoolBotClient({
	shards: 'auto',
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
	},
	makeCache: Options.cacheWithLimits({
		MessageManager: {
			maxSize: 0
		},
		UserManager: {
			maxSize: 1000,
			keepOverLimit: user => CACHED_ACTIVE_USER_IDS.has(user.id)
		},
		GuildMemberManager: {
			maxSize: 200,
			keepOverLimit: member => CACHED_ACTIVE_USER_IDS.has(member.user.id)
		},
		GuildEmojiManager: { maxSize: 1, keepOverLimit: i => [DEV_SERVER_ID, SupportServer].includes(i.guild.id) },
		GuildStickerManager: { maxSize: 0 },
		PresenceManager: { maxSize: 0 },
		VoiceStateManager: { maxSize: 0 },
		GuildInviteManager: { maxSize: 0 },
		ThreadManager: { maxSize: 0 },
		ThreadMemberManager: { maxSize: 0 }
	}),
	sweepers: {
		guildMembers: {
			interval: 60 * 60,
			filter: () => member => !CACHED_ACTIVE_USER_IDS.has(member.user.id)
		},
		users: {
			interval: 60 * 60,
			filter: () => user => !CACHED_ACTIVE_USER_IDS.has(user.id)
		}
	}
});

export const mahojiClient = new MahojiClient({
	developmentServerID: DEV_SERVER_ID,
	applicationID: globalConfig.clientID,
	commands: allCommands,
	handlers: {
		preCommand: async ({ command, interaction, options }) => {
			const result = await preCommand({
				abstractCommand: convertMahojiCommandToAbstractCommand(command),
				userID: interaction.user.id,
				guildID: interaction.guildId,
				channelID: interaction.channelId,
				bypassInhibitors: false,
				apiUser: interaction.user,
				options
			});
			return result;
		},
		postCommand: ({ command, interaction, error, inhibited, options }) =>
			postCommand({
				abstractCommand: convertMahojiCommandToAbstractCommand(command),
				userID: interaction.user.id,
				guildID: interaction.guildId,
				channelID: interaction.channelId,
				args: options,
				error,
				isContinue: false,
				inhibited,
				continueDeltaMillis: null
			})
	},
	djsClient: client
});

declare global {
	var globalClient: OldSchoolBotClient;
}

client.mahojiClient = mahojiClient;
global.globalClient = client;
client.on('messageCreate', msg => {
	onMessage(msg);
});
client.on('interactionCreate', async interaction => {
	if (BLACKLISTED_USERS.has(interaction.user.id)) return;
	if (interaction.guildId && BLACKLISTED_GUILDS.has(interaction.guildId)) return;

	if (!client.isReady()) {
		if (interaction.isChatInputCommand()) {
			await interaction.reply({
				content:
					'BSO is currently down for maintenance/updates, please try again in a couple minutes! Thank you <3',
				ephemeral: true
			});
		}
		return;
	}

	try {
		await interactionHook(interaction);
		if (interaction.isModalSubmit()) {
			await modalInteractionHook(interaction);
			return;
		}

		const result = await mahojiClient.parseInteraction(interaction);
		if (result === null) return;
		if (isObject(result) && 'error' in result) {
			await handleInteractionError(result.error, interaction);
		}
	} catch (err) {
		await handleInteractionError(err, interaction);
	}
});

client.on(Events.ServerNotification, (message: string) => {
	const channel = globalClient.channels.cache.get(Channel.Notifications);
	if (channel) (channel as TextChannel).send(message);
});

client.on(Events.EconomyLog, async (message: string) => {
	economyLog(message);
});
client.on('guildCreate', guild => {
	if (!guild.available) return;
	if (BLACKLISTED_GUILDS.has(guild.id) || BLACKLISTED_USERS.has(guild.ownerId)) {
		guild.leave();
	}
});

client.on('shardDisconnect', ({ wasClean, code, reason }) => debugLog('Shard Disconnect', { wasClean, code, reason }));
client.on('shardError', err => debugLog('Shard Error', { error: err.message }));
client.once('ready', () => runTimedLoggedFn('OnStartup', async () => onStartup()));

async function main() {
	if (process.env.TEST) return;
	await Promise.all([
		runTimedLoggedFn('Sync Active User IDs', syncActiveUserIDs),
		runTimedLoggedFn('Sync Activity Cache', syncActivityCache)
	]);
	await runTimedLoggedFn('Startup Scripts', runStartupScripts);

	await runTimedLoggedFn('Log In', () => client.login(botToken));
}

process.on('uncaughtException', err => {
	console.error(err);
	logError(err);
});

process.on('unhandledRejection', err => {
	console.error(err);
	logError(err);
});

main();
