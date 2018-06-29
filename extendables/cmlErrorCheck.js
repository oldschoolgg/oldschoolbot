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
			case 'User not in database':
				throw 'That user does not exist in the CrystalMathLabs database. Have you tried using +update?';
			case '-2':
			case 'Invalid username':
				throw 'That username is invalid.';
			case '-3':
			case 'Database error':
				throw 'Database error.';
			case '-4':
			case 'Server under heavy load; api temporarily disabled':
				throw 'The CrystalMathLabs API is currently offline. Please try again in 5 minutes.';
			default:
				return null;
		}
	}

}

module.exports = cmlErrorCheck;
