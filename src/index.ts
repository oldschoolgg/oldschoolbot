import './lib/data/itemAliases';
import 'reflect-metadata';

import * as Sentry from '@sentry/node';

import { botToken, SENTRY_DSN } from './config';
import { clientOptions } from './lib/config/config';
import { OldSchoolBotClient } from './lib/structures/OldSchoolBotClient';

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN
	});
}

export const client = new OldSchoolBotClient(clientOptions);

client.login(botToken);
