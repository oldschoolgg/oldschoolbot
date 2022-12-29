import 'source-map-support/register';
import './lib/customItems/customItems';
import './lib/data/itemAliases';
import './lib/crons';
import './lib/MUser';
import './lib/util/transactItemsFromBank';
import './lib/util/logger';

import * as Sentry from '@sentry/node';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { GatewayIntentBits, InteractionType, Options, Partials } from 'discord.js';
import { isObject, Time } from 'e';
import { MahojiClient } from 'mahoji';
import { bulkUpdateCommands } from 'mahoji/dist/lib/util';
import { join } from 'path';
import { debuglog } from 'util';

import { botToken, CLIENT_ID, DEV_SERVER_ID, production, SENTRY_DSN, SupportServer } from './config';
import { Channel, Events } from './lib/constants';
import { onMessage } from './lib/events';
import { modalInteractionHook } from './lib/modals';
import { runStartupScripts } from './lib/startupScripts';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';
import { syncActivityCache } from './lib/Task';
import { assert, getInteractionTypeName, runTimedLoggedFn } from './lib/util';
import { CACHED_ACTIVE_USER_IDS, syncActiveUserIDs } from './lib/util/cachedUserIDs';
import { interactionHook } from './lib/util/globalInteractions';
import { handleInteractionError } from './lib/util/interactionReply';
import { logError } from './lib/util/logError';
import { sendToChannelID } from './lib/util/webhook';
import { onStartup } from './mahoji/lib/events';
import { postCommand } from './mahoji/lib/postCommand';
import { preCommand } from './mahoji/lib/preCommand';
import { convertMahojiCommandToAbstractCommand } from './mahoji/lib/util';

debuglog('Starting...');

if (!production) {
	import('./lib/devHotReload');
}

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
	if (!client.isReady()) {
		if (interaction.isChatInputCommand()) {
			interaction.reply({
				content:
					'BSO is currently down for maintenance/updates, please try again in a couple minutes! Thank you <3',
				ephemeral: true
			});
		}
		return;
	}

	try {
		if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
			debugLog(`Process ${getInteractionTypeName(interaction.type)} interaction`, {
				type: 'COMMAND_INHIBITED',
				user_id: interaction.user.id,
				guild_id: interaction.guildId,
				channel_id: interaction.channelId,
				interaction_id: interaction.id,
				interaction_type: interaction.type
			});
		}
		await interactionHook(interaction);
		if (interaction.isModalSubmit()) {
			await modalInteractionHook(interaction);
			return;
		}

		const result = await mahojiClient.parseInteraction(interaction);
		if (result === null) return;
		if (isObject(result) && 'error' in result) {
			handleInteractionError(result.error, interaction);
		}
	} catch (err) {
		handleInteractionError(err, interaction);
	}
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

client.on('shardDisconnect', ({ wasClean, code, reason }) => debugLog('Shard Disconnect', { wasClean, code, reason }));
client.on('shardError', err => debugLog('Shard Error', { error: err.message }));

async function main() {
	await Promise.all([
		runTimedLoggedFn('Sync Active User IDs', syncActiveUserIDs),
		runTimedLoggedFn('Sync Activity Cache', syncActivityCache)
	]);
	await Promise.all([
		runTimedLoggedFn('Start Mahoji Client', async () => mahojiClient.start()),
		runTimedLoggedFn('Startup Scripts', runStartupScripts)
	]);
	await runTimedLoggedFn('Log In', () => client.login(botToken));
	runTimedLoggedFn('OnStartup', async () => onStartup());

	const totalCommands = globalClient.mahojiClient.commands.values;
	const globalCommands = totalCommands.filter(i => !i.guildID);
	await bulkUpdateCommands({
		client: globalClient.mahojiClient,
		commands: globalCommands,
		guildID: null
	});

	console.log(`Synced commands ${global ? 'globally' : 'locally'}.
${totalCommands.length} Total commands
${globalCommands.length} Global commands`);
}

process.on('uncaughtException', logError);

main();
