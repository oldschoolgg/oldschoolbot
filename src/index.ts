import './lib/customItems/customItems';
import './lib/data/itemAliases';
import './lib/crons';

import * as Sentry from '@sentry/node';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { botToken, SENTRY_DSN } from './config';
import { clientOptions } from './lib/config';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';

Chart.register(ChartDataLabels);

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN
	});
}

export const client = new OldSchoolBotClient(clientOptions);

client.on('ready', client.init);
client.login(botToken);
