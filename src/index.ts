import 'reflect-metadata';

import * as Sentry from '@sentry/node';

import { botToken, sentryDSN } from './config';
import { clientOptions } from './lib/config/config';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';

if (sentryDSN) {
	Sentry.init({
		dsn: sentryDSN
	});
}

new OldSchoolBotClient(clientOptions).init().then(client => client.login(botToken));
