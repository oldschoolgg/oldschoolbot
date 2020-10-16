import 'reflect-metadata';

import { Client as TagsClient } from '@kcp/tags';
import * as Sentry from '@sentry/node';
import { Client, KlasaClientOptions } from 'klasa';
import { Bank, Items } from 'oldschooljs';
import pLimit from 'p-limit';

import { botToken, sentryDSN } from './config';
import { clientOptions, clientProperties } from './lib/config/config';
import { initItemAliases } from './lib/itemAliases';
import { fishingTrawlerLoot } from './lib/simulation/fishingTrawler';

if (sentryDSN) {
	Sentry.init({
		dsn: sentryDSN
	});
}

const loot = new Bank();
for (let i = 0; i < 100; i++) {
	console.log(fishingTrawlerLoot(1, loot.bank));
	loot.add(fishingTrawlerLoot(1, loot.bank));
}
console.log(loot.bank);

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

	public init = async (): Promise<this> => {
		await Items.fetchAll();
		initItemAliases();
		return this;
	};
}

if (1 > 2) new OldSchoolBot(clientOptions).init().then(client => client.login(botToken));
