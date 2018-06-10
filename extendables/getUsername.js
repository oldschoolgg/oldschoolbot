const { Extendable } = require('klasa');

class getUsername extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			enabled: true,
			klasa: true
		});
	}

	extend(username, msg) {
		if (!username && !msg.author.configs.RSN) throw 'Please specify a username.';
		if (typeof username === 'object') {
			if (!username.configs.RSN) throw "That person doesn't have an RSN set.";
			username = username.configs.RSN;
		} else if (!username) {
			username = msg.author.configs.RSN;
		}
		return username;
	}

}

module.exports = getUsername;
