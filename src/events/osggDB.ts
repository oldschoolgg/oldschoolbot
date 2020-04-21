import { Event, EventStore } from 'klasa';
import { MongoClient } from 'mongodb';

import { mongoDBConfig } from '../config';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true, event: 'klasaReady' });
		this.enabled = this.client.production;
	}

	async run() {
		if (!mongoDBConfig) return;

		const client = await MongoClient.connect(mongoDBConfig.dbUrl, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}).catch(err => {
			throw err;
		});

		if (!client) {
			console.error('Failed to connect to mongodb.');
			return;
		}

		this.client.osggDB = client.db(mongoDBConfig.dbName);

		// Enable collections command only after the DB is connected.
		this.client.commands.get('collections')!.enable();
	}
}
