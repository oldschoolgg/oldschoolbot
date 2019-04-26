const { Client } = require('klasa');
const {
	token,
	clientOptions,
	clientProperties
} = require('../config');

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
