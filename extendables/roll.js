const { Extendable } = require('klasa');

class roll extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			enabled: true,
			klasa: true
		});
	}

	extend(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}

}

module.exports = roll;
