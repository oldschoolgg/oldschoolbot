import './lib/data/itemAliases';
import './lib/crons';
import './lib/MUser';

import * as Sentry from '@sentry/node';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { watch } from 'chokidar';
import { TextChannel } from 'discord.js';
import { debounce, isObject } from 'e';
import { MahojiClient } from 'mahoji';
import { extname, join, sep } from 'path';

import { botToken, CLIENT_ID, DEV_SERVER_ID, production, SENTRY_DSN } from './config';
import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from './lib/blacklists';
import { clientOptions } from './lib/config';
import { Channel, Events, SILENT_ERROR } from './lib/constants';
import { onMessage } from './lib/events';
import { makeServer } from './lib/http';
import { modalInteractionHook } from './lib/modals';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';
import { initTickers } from './lib/tickers';
import { interactionHook } from './lib/util/globalInteractions';
import { interactionReply } from './lib/util/interactionReply';
import { logError } from './lib/util/logError';
import { sendToChannelID } from './lib/util/webhook';
import { onStartup } from './mahoji/lib/events';
import { postCommand } from './mahoji/lib/postCommand';
import { preCommand } from './mahoji/lib/preCommand';
import { convertMahojiCommandToAbstractCommand } from './mahoji/lib/util';

Chart.register(ChartDataLabels);

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN
	});
}

const client = new OldSchoolBotClient(clientOptions);

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
			return result?.reason;
		},
		postCommand: ({ command, interaction, error, inhibited }) =>
			postCommand({
				abstractCommand: convertMahojiCommandToAbstractCommand(command),
				userID: interaction.user.id,
				guildID: interaction.guildId,
				channelID: interaction.channelId,
				args: interaction.options,
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

	interactionHook(interaction);
	if (interaction.isModalSubmit()) {
		modalInteractionHook(interaction);
		return;
	}

	const result = await mahojiClient.parseInteraction(interaction);
	if (result === null) return;

	if (isObject(result) && 'error' in result) {
		if (result.error.message === SILENT_ERROR) return;
		logError(result.error, {
			interaction: JSON.stringify(interaction)
		});
		if (interaction.isChatInputCommand()) {
			try {
				await interactionReply(interaction, 'Sorry, an error occured while trying to run this command.');
			} catch (err: unknown) {
				logError(err, {
					user_id: interaction.user.id,
					interaction: JSON.stringify(interaction)
				});
			}
		}
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

initTickers();

async function main() {
	client.fastifyServer = makeServer();
	await mahojiClient.start();
	console.log('Starting mahoji client...');
	await client.login(botToken);
	console.log('Logging in...');
	await client.init();
	console.log('Init...');
	await onStartup();
}

const terminateCb = async () => {
	await globalClient.destroy();
	process.exit(0);
};

process.removeAllListeners('SIGTERM');
process.removeAllListeners('SIGINT');

process.on('SIGTERM', terminateCb);
process.on('SIGINT', terminateCb);
process.on('uncaughtException', logError);

main();

if (!production) {
	const nodeModules = `${sep}node_modules${sep}`;
	globalClient._fileChangeWatcher = watch(join(process.cwd(), 'dist/**/*.js'), {
		persistent: true,
		ignoreInitial: true
	});

	const reloadStore = async () => {
		for (const module of Object.keys(require.cache)) {
			if (!module.includes(nodeModules) && extname(module) !== '.node') {
				if (module.includes('OldSchoolBotClient')) continue;
				if (module.includes(`dist${sep}index`)) continue;
				delete require.cache[module];
			}
		}
		await mahojiClient.commands.load();
	};

	for (const event of ['add', 'change', 'unlink']) {
		if (globalClient._fileChangeWatcher) {
			globalClient._fileChangeWatcher.on(event, debounce(reloadStore, 1000));
		}
	}
}
