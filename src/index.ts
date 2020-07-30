import { Client, KlasaClientOptions } from 'klasa';
import { Client as TagsClient } from '@kcp/tags';
import pLimit from 'p-limit';
import * as Sentry from '@sentry/node';

import { clientOptions, clientProperties } from './lib/config/config';
import { botToken, sentryDSN } from './config';

if (sentryDSN) {
	Sentry.init({
		dsn: sentryDSN
	});
}

Client.use(TagsClient);

import('./lib/settings/schemas/ClientSchema');
import('./lib/settings/schemas/UserSchema');
import('./lib/settings/schemas/GuildSchema');

class OldSchoolBot extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	public secondaryUserBusyCache = new Set<string>();
	public queuePromise = pLimit(1);

	constructor(options: KlasaClientOptions) {
		super(options);
		for (const prop of Object.keys(clientProperties)) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			this[prop] = clientProperties[prop];
		}
	}
}

new OldSchoolBot(clientOptions).login(botToken);
