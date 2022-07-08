import { Client } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient } from 'klasa';

import { logError } from '../lib/util/logError';
import PostgresProvider from '../providers/postgres';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Client] });
	}

	async query(this: KlasaClient, query: string, values?: string[]) {
		return (this.providers.default as PostgresProvider).runAll(query, values);
	}

	async wtf(this: KlasaClient, error: Error) {
		logError(error);
	}
}
