const { Extendable } = require('klasa');

class differenceInDays extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			enabled: true,
			klasa: true
		});
	}

	extend(first, second) {
		return parseInt((second - first) / (1000 * 60 * 60 * 24));
	}

}

module.exports = differenceInDays;
