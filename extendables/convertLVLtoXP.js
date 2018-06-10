const { Extendable } = require('klasa');

class convertLVLtoXP extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			enabled: true,
			klasa: true
		});
	}

	extend(lvl) {
		let points = 0;

		for (let i = 1; i < lvl; i++) {
			points += Math.floor(i + (300 * Math.pow(2, i / 7)));
		}

		return Math.floor(points / 4);
	}

}

module.exports = convertLVLtoXP;
