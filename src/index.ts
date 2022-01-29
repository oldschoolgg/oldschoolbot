import './lib/data/itemAliases';

import * as Sentry from '@sentry/node';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { APIInteraction, GatewayDispatchEvents, InteractionResponseType, InteractionType, MahojiClient } from 'mahoji';
import { SlashCommandResponse } from 'mahoji/dist/lib/types';
import { join } from 'path';

import { botToken, SENTRY_DSN } from './config';
import { clientOptions } from './lib/config';
import { SILENT_ERROR } from './lib/constants';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';
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
	developmentServerID: '342983479501389826',
	applicationID: '829398443821891634',
	storeDirs: [join('dist', 'mahoji')],
	handlers: {
		preCommand: ({ command, interaction }) =>
			preCommand({
				abstractCommand: convertMahojiCommandToAbstractCommand(command),
				userID: interaction.userID.toString(),
				guildID: interaction.guildID.toString(),
				channelID: interaction.channelID.toString()
			}),
		postCommand: ({ command, interaction, error }) =>
			postCommand({
				abstractCommand: convertMahojiCommandToAbstractCommand(command),
				userID: interaction.userID.toString(),
				guildID: interaction.guildID.toString(),
				channelID: interaction.channelID.toString(),
				args: interaction.options,
				error,
				msg: null,
				isContinue: false
			})
	}
});

export const client = new OldSchoolBotClient(clientOptions);
client.on('raw', async event => {
	if (![GatewayDispatchEvents.InteractionCreate].includes(event.t)) return;
	const data = event.d as APIInteraction;
	const result = await mahojiClient.parseInteraction(data);

	if (result === null) return;

	if ('error' in result) {
		if (result.error.message === SILENT_ERROR) return;

		if (result.type === InteractionType.ApplicationCommand) {
			const ERROR_RESPONSE: SlashCommandResponse = {
				response: {
					data: { content: 'Sorry, an errored occured while trying to run this command.' },
					type: InteractionResponseType.ChannelMessageWithSource
				},
				interaction: result.interaction,
				type: InteractionType.ApplicationCommand
			};
			result.interaction.respond(ERROR_RESPONSE);
		}
		return;
	}
	if (result.type === InteractionType.ApplicationCommand) {
		return result.interaction.respond(result);
	}
	if (result.type === InteractionType.ApplicationCommandAutocomplete) {
		return result.interaction.respond(result);
	}
});
client.on('ready', client.init);
mahojiClient.start();
client.login(botToken);
