const { Event } = require('klasa');
const { MongoClient } = require('mongodb');

const { dbUrl, dbName } = require('../../config/private').mongoDB;

module.exports = class extends Event {
	constructor(...args) {
		super(...args, { once: true, event: 'klasaReady' });
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
		this.client.commands.get('collections').enable();
	}
};
