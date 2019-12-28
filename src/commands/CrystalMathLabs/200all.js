const { Command } = require('klasa');
const fetch = require('node-fetch');

const { cmlErrorCheck } = require('../../../config/util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Shows the Time to 200m all of an account',
			usage: '(username:...rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const time = await fetch(
			`http://crystalmathlabs.com/tracker/api.php?type=virtualhiscores&page=timeto200mall&players=${username}`
		)
			.then(res => res.text())
			.then(
				async res =>
					cmlErrorCheck(res) || parseInt(res.split(',')[1].split('.')[0]).toLocaleString()
			);

		return msg.sendLocale('TT200_RESULT', [username, time]);
	}
};
