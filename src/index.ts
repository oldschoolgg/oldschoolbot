import './lib/safeglobals.js';
import './lib/globals.js';
import './lib/MUser.js';
import './lib/ActivityManager.js';

import { convertMahojiCommandToAbstractCommand, Events, isObject, MahojiClient } from '@oldschoolgg/toolkit';
import { init } from '@sentry/node';
import { GatewayIntentBits, Options, Partials, type TextChannel } from 'discord.js';

import { onStartup } from '@/mahoji/lib/events.js';
import { exitCleanup } from '@/mahoji/lib/exitHandler.js';
import { postCommand } from '@/mahoji/lib/postCommand.js';
import { preCommand } from '@/mahoji/lib/preCommand.js';
import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from './lib/blacklists.js';
import { Channel, gitHash, globalConfig } from './lib/constants.js';
import { economyLog } from './lib/economyLogs.js';
import { onMessage } from './lib/events.js';
import { modalInteractionHook } from './lib/modals.js';
import { preStartup } from './lib/preStartup.js';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient.js';
import { CACHED_ACTIVE_USER_IDS } from './lib/util/cachedUserIDs.js';
import { interactionHook } from './lib/util/globalInteractions.js';
import { handleInteractionError, interactionReply } from './lib/util/interactionReply.js';
import { logError } from './lib/util/logError.js';
import { allCommands } from './mahoji/commands/allCommands.js';

if (globalConfig.sentryDSN) {
	init({
		dsn: globalConfig.sentryDSN,
		defaultIntegrations: false,
		integrations: [],
		release: gitHash
	});
}

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
		GuildEmojiManager: {
			maxSize: 1,
			keepOverLimit: i => globalConfig.supportServerID === i.guild.id
		},
		GuildStickerManager: { maxSize: 0 },
		PresenceManager: { maxSize: 0 },
		VoiceStateManager: { maxSize: 0 },
		GuildInviteManager: { maxSize: 0 },
		ThreadManager: { maxSize: 0 },
		ThreadMemberManager: { maxSize: 0 },
		AutoModerationRuleManager: { maxSize: 0 },
		GuildMessageManager: { maxSize: 0 },
		GuildBanManager: { maxSize: 0 },
		GuildForumThreadManager: { maxSize: 0 },
		GuildScheduledEventManager: { maxSize: 0 },
		GuildTextThreadManager: { maxSize: 0 },
		BaseGuildEmojiManager: { maxSize: 0 },
		ReactionManager: { maxSize: 0 },
		DMMessageManager: { maxSize: 0 },
		ReactionUserManager: { maxSize: 0 },
		StageInstanceManager: { maxSize: 0 }
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
	}
});

declare global {
	var globalClient: OldSchoolBotClient;
}

client.mahojiClient = mahojiClient;
global.globalClient = client;
client.on('messageCreate', msg => {
	onMessage(msg);
});
client.on('error', console.error);

const usernameInsertedCache = new Set<string>();

client.on('interactionCreate', async interaction => {
	if (globalClient.isShuttingDown) {
		if (interaction.isRepliable()) {
			await interactionReply(interaction, {
				content:
					'The bot is currently shutting down for maintenance/updates, please try again in a couple minutes! Thank you <3',
				ephemeral: true
			});
		}
		return;
	}

	if (!usernameInsertedCache.has(interaction.user.id)) {
		usernameInsertedCache.add(interaction.user.id);
		await prisma.user
			.upsert({
				where: {
					id: interaction.user.id
				},
				create: {
					id: interaction.user.id,
					last_command_date: new Date(),
					username: interaction.user.username
				},
				update: {
					last_command_date: new Date(),
					username: interaction.user.username
				},
				select: {
					id: true
				}
			})
			.catch(console.error);
	}

	if (
		BLACKLISTED_USERS.has(interaction.user.id) ||
		(interaction.guildId && BLACKLISTED_GUILDS.has(interaction.guildId))
	) {
		if (interaction.isRepliable()) {
			await interactionReply(interaction, {
				content: 'You are blacklisted.',
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
	if (channel) {
		(channel as TextChannel).send({ content: message, allowedMentions: { parse: [], users: [], roles: [] } });
	}
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

client.on('shardError', err => debugLog('Shard Error', { error: err.message }));
client.once('ready', () => onStartup());

async function main() {
	console.log('Starting up...');
	await Promise.all([
		preStartup(),
		import('exit-hook').then(({ asyncExitHook }) =>
			asyncExitHook(exitCleanup, {
				wait: 2000
			})
		),
		client.login(globalConfig.botToken)
	]);
	console.log(`Logged in as ${globalClient.user.username}`);

	// if (process.env.NODE_ENV !== 'production' && Boolean(process.env.TEST_BOT_SERVER)) {
	// 	import('@/testing/testServer.js').then(_mod => _mod.startTestBotServer());
	// }
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
