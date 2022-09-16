import './lib/customItems/customItems';
import './lib/data/itemAliases';
import './lib/crons';
import './lib/MUser';

import * as Sentry from '@sentry/node';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { watch } from 'chokidar';
import { TextChannel } from 'discord.js';
import { debounce } from 'e';
import {
	APIInteraction,
	GatewayDispatchEvents,
	InteractionResponseType,
	InteractionType,
	MahojiClient,
	MessageFlags,
	Routes
} from 'mahoji';
import { SlashCommandResponse } from 'mahoji/dist/lib/types';
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

export const mahojiClient = new MahojiClient({
	discordToken: botToken,
	developmentServerID: DEV_SERVER_ID,
	applicationID: CLIENT_ID,
	storeDirs: [join('dist', 'mahoji')],
	handlers: {
		preCommand: async ({ command, interaction }) => {
			const result = await preCommand({
				abstractCommand: convertMahojiCommandToAbstractCommand(command),
				userID: interaction.userID.toString(),
				guildID: interaction.guildID?.toString(),
				channelID: interaction.channelID.toString(),
				bypassInhibitors: false,
				apiUser: interaction.user
			});
			return result?.reason;
		},
		postCommand: ({ command, interaction, error, inhibited }) =>
			postCommand({
				abstractCommand: convertMahojiCommandToAbstractCommand(command),
				userID: interaction.userID.toString(),
				guildID: interaction.guildID?.toString(),
				channelID: interaction.channelID.toString(),
				args: interaction.options,
				error,
				isContinue: false,
				inhibited
			})
	}
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

const client = new OldSchoolBotClient(clientOptions);
client.mahojiClient = mahojiClient;
global.globalClient = client;
client.on('messageCreate', onMessage);
client.on('raw', async event => {
	if (![GatewayDispatchEvents.InteractionCreate].includes(event.t)) return;
	const data = event.d as APIInteraction;

	if (!client.isReady()) {
		if (data.type === InteractionType.ApplicationCommand) {
			await mahojiClient.restManager.post(Routes.interactionCallback(data.id, data.token), {
				body: {
					data: {
						content:
							'Bot School Old is currently down for maintenance/updates, please try again in a few seconds! Thank you <3',
						flags: MessageFlags.Ephemeral
					},
					type: InteractionResponseType.ChannelMessageWithSource
				}
			});
		}
		return;
	}

	interactionHook(data);
	if (data.type === InteractionType.ModalSubmit) return modalInteractionHook(data);
	const result = await mahojiClient.parseInteraction(data);
	if (result === null) return;

	if ('error' in result) {
		if (result.error.message === SILENT_ERROR) return;
		logError(result.error, {
			user_id: result.interaction.userID.toString(),
			name: result.interaction.data.interaction.data?.name ?? 'None'
		});
		if (result.type === InteractionType.ApplicationCommand) {
			const ERROR_RESPONSE: SlashCommandResponse = {
				response: {
					data: { content: 'Sorry, an error occured while trying to run this command.' },
					type: InteractionResponseType.ChannelMessageWithSource
				},
				interaction: result.interaction,
				type: InteractionType.ApplicationCommand
			};
			try {
				await result.interaction.respond(ERROR_RESPONSE);
			} catch (err: unknown) {
				logError(err, {
					user_id: result.interaction.userID.toString(),
					name: result.interaction.data.interaction.data?.name ?? 'None',
					command: result.interaction.command.name
				});
			}
		}
		return;
	}
	if (result.type === InteractionType.ApplicationCommand) {
		try {
			await result.interaction.respond(result);
		} catch (err: unknown) {
			logError(err, {
				user_id: result.interaction.userID.toString(),
				name: result.interaction.data.interaction.data?.name ?? 'None',
				command: result.interaction.command.name
			});
		}
	}
	if (result.type === InteractionType.ApplicationCommandAutocomplete) {
		return result.interaction.respond(result);
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
			content: economyLogBuffer.join('\n---------------------------------\n')
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
