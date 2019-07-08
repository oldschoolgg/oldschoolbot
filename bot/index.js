const { Client } = require('klasa');
const { token, clientOptions, clientProperties } = require('../config');

Client.use(require('@kcp/tags'));
Client.use(require('klasa-textchannel-gateway'));
Client.use(require('klasa-dashboard-hooks'));

require('../config/Schemas');

class OldSchoolBot extends Client {

	constructor(options) {
		super(options);
		for (const prop in clientProperties) {
			this[prop] = clientProperties[prop];
		}
	}

}

new OldSchoolBot(clientOptions).login(token);
