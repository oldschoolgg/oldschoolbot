import './lib/data/itemAliases';
import './lib/crons';

import { Stopwatch } from '@sapphire/stopwatch';
import * as Sentry from '@sentry/node';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { APIInteraction, GatewayDispatchEvents, InteractionResponseType, InteractionType, MahojiClient } from 'mahoji';
import { SlashCommandResponse } from 'mahoji/dist/lib/types';
import { join } from 'path';

import { botToken, CLIENT_ID, DEV_SERVER_ID, SENTRY_DSN } from './config';
import { clientOptions } from './lib/config';
import { SILENT_ERROR } from './lib/constants';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';
import { logError } from './lib/util/logError';
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
				bypassInhibitors: false
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
				msg: null,
				isContinue: false,
				inhibited
			})
	}
});

export const client = new OldSchoolBotClient(clientOptions);
client.on('raw', async event => {
	if (![GatewayDispatchEvents.InteractionCreate].includes(event.t)) return;
	// TODO: Ignore interactions if client not ready, they will error and fail to execute
	// if they use things depending on the client being ready. For now, we have to
	// just have them fail/error for the user.
	if (!client.ready) return;

	const data = event.d as APIInteraction;
	client.emit('debug', `Received ${data.type} interaction`);

	const timer = new Stopwatch();
	const result = await mahojiClient.parseInteraction(data);
	timer.stop();
	client.emit(
		'debug',
		`Parsed ${result?.interaction?.data.interaction.data?.name ?? 'None'} interaction in ${timer.duration}ms`
	);

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
client.on('ready', client.init);
client.on('ready', onStartup);
mahojiClient.start();
mahojiClient._djsClient = client;
client.login(botToken);
