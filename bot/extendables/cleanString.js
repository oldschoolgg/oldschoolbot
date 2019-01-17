const { Extendable, Command } = require('klasa');

class cleanString extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: [Command],
			enabled: true,
			klasa: true
		});
	}

	cleanString(string, uppercase = false) {
		const clean = string.replace(/\W/g, '');
		return uppercase ? clean.toUpperCase() : clean;
	}

}

module.exports = cleanString;
