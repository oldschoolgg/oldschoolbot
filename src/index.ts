import { Client, KlasaClientOptions } from 'klasa';

const { token, clientOptions, clientProperties } = require('../config');

Client.use(require('@kcp/tags'));
Client.use(require('klasa-textchannel-gateway'));

require('../config/Schemas');

class OldSchoolBot extends Client {
	public oneCommandAtATimeCache = new Set<string>();
	constructor(options: KlasaClientOptions) {
		super(options);
		for (const prop in clientProperties) {
			// @ts-ignore
			this[prop] = clientProperties[prop];
		}
	}
}

new OldSchoolBot(clientOptions).login(token);
