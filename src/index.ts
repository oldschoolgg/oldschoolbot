import { Client, KlasaClientOptions } from 'klasa';
import { Client as TagsClient } from '@kcp/tags';
import { Client as KDHClient } from 'klasa-dashboard-hooks';
import pLimit from 'p-limit';

import { clientOptions, clientProperties } from './lib/config/config';
import { botToken } from './config';

Client.use(TagsClient);
Client.use(KDHClient);

import('./lib/schemas/ClientSchema');
import('./lib/schemas/UserSchema');
import('./lib/schemas/GuildSchema');

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
