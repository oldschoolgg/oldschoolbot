import { Event, EventStore } from 'klasa';
import { MongoClient } from 'mongodb';

const { dbUrl, dbName } = require('../../config/private').mongoDB;

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { once: true, event: 'klasaReady' });
		this.enabled = this.client.production;
	}

	async run() {
		const client = await MongoClient.connect(dbUrl, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}).catch(err => {
			throw err;
		});

		if (!client) {
			console.error('Failed to connect to mongodb.');
			return;
		}

		this.client.osggDB = client.db(dbName);

		// Enable collections command only after the DB is connected.
		this.client.commands.get('collections')!.enable();
	}
}
