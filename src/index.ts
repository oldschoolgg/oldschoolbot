import './lib/safeglobals.js';
import './lib/globals.js';
import './lib/MUser.js';

import { Events } from '@oldschoolgg/toolkit';
import { init } from '@sentry/node';
import { GatewayIntentBits, Options, Partials, type TextChannel } from 'discord.js';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { Channel, gitHash, globalConfig } from '@/lib/constants.js';
import { interactionHandler } from '@/lib/discord/interactionHandler.js';
import { economyLog } from '@/lib/economyLogs.js';
import { onMessage } from '@/lib/events.js';
import { preStartup } from '@/lib/preStartup.js';
import { OldSchoolBotClient } from '@/lib/structures/OldSchoolBotClient.js';
import { CACHED_ACTIVE_USER_IDS } from '@/lib/util/cachedUserIDs.js';
import { logError } from '@/lib/util/logError.js';
import { installGracefulShutdown } from '@/mahoji/commands/sync/installGracefulShutdown.js';
import { onStartup } from '@/mahoji/lib/events.js';
import { exitCleanup } from '@/mahoji/lib/exitHandler.js';

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

declare global {
	var globalClient: OldSchoolBotClient;
}

global.globalClient = client;
client.on('messageCreate', msg => {
	onMessage(msg);
});
client.on('error', console.error);

client.on('interactionCreate', interactionHandler);

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
client.once('ready', async () => {
	installGracefulShutdown({
		rest: globalClient.rest,
		clientId: globalConfig.clientID,
		supportGuildId: globalConfig.supportServerID,
		isProduction: globalConfig.isProduction
	});

	await onStartup();
});

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
