import 'reflect-metadata';

import { Client as TagsClient } from '@kcp/tags';
import * as Sentry from '@sentry/node';
import { Client } from 'klasa';
import pLimit from 'p-limit';

import { botToken, sentryDSN } from './config';
import { clientOptions } from './lib/config/config';
import { initCustomItems } from './lib/customItems';
import { initItemAliases } from './lib/itemAliases';

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

	public init = async (): Promise<this> => {
		initCustomItems();
		initItemAliases();
		return this;
	};
}

new OldSchoolBot(clientOptions).init().then(client => client.login(botToken));
