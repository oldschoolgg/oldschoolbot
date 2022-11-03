import './lib/data/itemAliases';
import './lib/crons';
import './lib/MUser';

import * as Sentry from '@sentry/node';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GatewayIntentBits, Options, Partials, TextChannel } from 'discord.js';
import { isObject, Time } from 'e';
import { MahojiClient } from 'mahoji';
import { join } from 'path';

import { botToken, CLIENT_ID, DEV_SERVER_ID, production, SENTRY_DSN, SupportServer } from './config';
import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from './lib/blacklists';
import { Channel, Events, SILENT_ERROR } from './lib/constants';
import { onMessage } from './lib/events';
import { makeServer } from './lib/http';
import { modalInteractionHook } from './lib/modals';
import { runStartupScripts } from './lib/startupScripts';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';
import { syncActivityCache } from './lib/Task';
import { UserError } from './lib/UserError';
import { assert, runTimedLoggedFn } from './lib/util';
import { CACHED_ACTIVE_USER_IDS, syncActiveUserIDs } from './lib/util/cachedUserIDs';
import { interactionHook } from './lib/util/globalInteractions';
import { interactionReply } from './lib/util/interactionReply';
import { startLog } from './lib/util/log';
import { logError, logErrorForInteraction } from './lib/util/logError';
import { sendToChannelID } from './lib/util/webhook';
import { onStartup } from './mahoji/lib/events';
import { postCommand } from './mahoji/lib/postCommand';
import { preCommand } from './mahoji/lib/preCommand';
import { convertMahojiCommandToAbstractCommand } from './mahoji/lib/util';

if (!production) {
	import('./lib/devHotReload');
}

startLog();

Chart.register(ChartDataLabels);

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN
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
			interval: Time.Minute * 15,
			filter: () => member => !CACHED_ACTIVE_USER_IDS.has(member.user.id)
		},
		users: {
			interval: Time.Minute * 15,
			filter: () => user => !CACHED_ACTIVE_USER_IDS.has(user.id)
		}
	}
});

export const mahojiClient = new MahojiClient({
	developmentServerID: DEV_SERVER_ID,
	applicationID: CLIENT_ID,
	storeDirs: [join('dist', 'mahoji')],
	handlers: {
		preCommand: async ({ command, interaction }) => {
			const result = await preCommand({
				abstractCommand: convertMahojiCommandToAbstractCommand(command),
				userID: interaction.user.id,
				guildID: interaction.guildId,
				channelID: interaction.channelId,
				bypassInhibitors: false,
				apiUser: interaction.user
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
				inhibited
			})
	},
	djsClient: client
});

declare global {
	const globalClient: OldSchoolBotClient;
}
declare global {
	namespace NodeJS {
		interface Global {
			globalClient: OldSchoolBotClient;
		}
	}
}

client.mahojiClient = mahojiClient;
global.globalClient = client;
client.on('messageCreate', onMessage);
client.on('interactionCreate', async interaction => {
	try {
		if (BLACKLISTED_USERS.has(interaction.user.id)) return;
		if (interaction.guildId && BLACKLISTED_GUILDS.has(interaction.guildId)) return;

		if (!client.isReady()) {
			if (interaction.isChatInputCommand()) {
				interaction.reply({
					content:
						'Old School Bot is currently down for maintenance/updates, please try again in a couple minutes! Thank you <3',
					ephemeral: true
				});
			}
			return;
		}

		await interactionHook(interaction);
		if (interaction.isModalSubmit()) {
			await modalInteractionHook(interaction);
			return;
		}

		const result = await mahojiClient.parseInteraction(interaction);
		if (result === null) return;

		if (isObject(result) && 'error' in result) {
			if (result.error.message === SILENT_ERROR) return;
			if (result.error instanceof UserError && interaction.isRepliable() && !interaction.replied) {
				await interaction.reply(result.error.message);
				return;
			}
			logErrorForInteraction(result.error, interaction);
			if (interaction.isChatInputCommand()) {
				try {
					await interactionReply(interaction, 'Sorry, an error occured while trying to run this command.');
				} catch (err: unknown) {
					logErrorForInteraction(err, interaction);
				}
			}
		}
	} catch (err) {
		logErrorForInteraction(err, interaction);
	}
});

client.on(Events.ServerNotification, (message: string) => {
	const channel = globalClient.channels.cache.get(Channel.Notifications);
	if (channel && globalClient.production) (channel as TextChannel).send(message);
});
let economyLogBuffer: string[] = [];

client.on(Events.EconomyLog, async (message: string) => {
	economyLogBuffer.push(message);
	if (economyLogBuffer.length === 10) {
		await sendToChannelID(Channel.EconomyLogs, {
			content: economyLogBuffer.join('\n---------------------------------\n'),
			allowedMentions: { parse: [], users: [], roles: [] }
		});
		economyLogBuffer = [];
	}
});
client.on('guildCreate', guild => {
	if (!guild.available) return;
	if (BLACKLISTED_GUILDS.has(guild.id) || BLACKLISTED_USERS.has(guild.ownerId)) {
		guild.leave();
	}
});

async function main() {
	client.fastifyServer = makeServer();
	runTimedLoggedFn('Sync Active User IDs', syncActiveUserIDs);
	runTimedLoggedFn('Sync Activity Cache', syncActivityCache);
	await Promise.all([
		runTimedLoggedFn('Start Mahoji Client', async () => mahojiClient.start()),
		runTimedLoggedFn('Startup Scripts', runStartupScripts)
	]);
	await runTimedLoggedFn('Log In', () => client.login(botToken));
	runTimedLoggedFn('OnStartup', async () => onStartup());
}

process.on('uncaughtException', logError);

main();
