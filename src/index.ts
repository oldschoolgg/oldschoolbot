import './lib/data/itemAliases';

import * as Sentry from '@sentry/node';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { APIInteraction, GatewayDispatchEvents, InteractionResponseType, MahojiClient, Routes } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { join } from 'path';

import { botToken, SENTRY_DSN } from './config';
import { clientOptions } from './lib/config';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';

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
	storeDirs: [join('dist', 'mahoji')]
});

export const client = new OldSchoolBotClient(clientOptions);
client.on('raw', async event => {
	if (![GatewayDispatchEvents.InteractionCreate].includes(event.t)) return;
	const data = event.d as APIInteraction;
	const result = await mahojiClient.parseInteraction(data);
	if (result) {
		if (
			result.interaction instanceof SlashCommandInteraction &&
			result.response.type === InteractionResponseType.ChannelMessageWithSource
		) {
			// If this response is for a deferred interaction, we have to use a different route/method/body.
			if (result.interaction.deferred) {
				await mahojiClient.restManager.patch(
					Routes.webhookMessage(mahojiClient.applicationID, result.interaction.token),
					{
						body: { ...result.response.data, attachments: undefined },
						attachments:
							result.response.data && 'attachments' in result.response.data
								? result.response.data.attachments?.map(a => ({
										fileName: a.fileName,
										rawBuffer: a.buffer
								  }))
								: undefined
					}
				);
				return;
			}

			await mahojiClient.restManager.post(Routes.interactionCallback(data.id, data.token), {
				body: { ...result.response, attachments: undefined },
				attachments:
					result.response.data && 'attachments' in result.response.data
						? result.response.data.attachments?.map(a => ({
								fileName: a.fileName,
								rawBuffer: a.buffer
						  }))
						: undefined
			});
		}
	}
});
client.on('ready', client.init);
mahojiClient.start();
client.login(botToken);
