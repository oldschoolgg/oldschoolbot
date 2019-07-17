const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	async run(msg, command) {
		if (command.category === 'CrystalMathLabs') {
			throw 'CrystalMathLabs commands are currently not working due to ' +
				'issues they have having with their API. This is not something ' +
				'we can fix. You can join the support server if you have any ' +
				'further questions. <http://support.oldschool.gg>';
		}
	}

};
