const { Extendable } = require('klasa');

class roll extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command', 'Monitor', 'Finalizer'],
			enabled: true,
			klasa: true
		});
	}

	extend(max) {
		return Math.floor((Math.random() * max) + 1) === 1;
	}

}

module.exports = roll;
