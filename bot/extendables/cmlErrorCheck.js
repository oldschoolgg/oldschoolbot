const { Extendable } = require('klasa');

class cmlErrorCheck extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Command'],
			enabled: true,
			klasa: true
		});
	}

	async extend(msg, res) {
		switch (res.text.replace(/\s/g, '')) {
			case '-1':
				throw 'That user does not exist in the CrystalMathLabs database. Have you tried using +update?';
			case '-2':
				throw 'That username is invalid.';
			case '-3':
			case '-4':
				throw 'The CrystalMathLabs API is currently offline. Please try again in 5 minutes.';
			default:
				return null;
		}
	}

}

module.exports = cmlErrorCheck;
