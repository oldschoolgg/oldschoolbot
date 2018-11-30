const { Command, Extendable } = require('klasa');

class getUsername extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	getUsername(username, msg) {
		const prefix = msg.guild ? msg.guild.settings.get('prefix') : '+';
		if (!username && !msg.author.settings.get('RSN')) {
			throw `Please specify a username, or set one with \`${prefix}setrsn <username>\``;
		}

		if (typeof username === 'object') {
			if (!username.settings.get('RSN')) throw "That person doesn't have an RSN set.";
			username = username.settings.get('RSN');
		} else if (!username) {
			username = msg.author.settings.get('RSN');
		}
		return username;
	}

}

module.exports = getUsername;
