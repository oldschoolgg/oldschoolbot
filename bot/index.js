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
		// this.jmodRedditAccounts = jmodRedditAccounts;
	}

	roll(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}

}

new OldSchoolBot(clientOptions).login(token);
