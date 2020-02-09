const { Command } = require('klasa');
const fetch = require('node-fetch');

const { cmlErrorCheck } = require('../../../config/util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: [],
			description: 'Shows the Time to Max of an account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			enabled: false
		});
	}

	async run(msg, [username]) {
		const ttm = await fetch(
			`https://crystalmathlabs.com/tracker/api.php?type=ttm&player=${username}`
		)
			.then(res => res.text())
			.then(res => cmlErrorCheck(res) || res);

		return msg.send(`**${username}**'s Time to Max is **${ttm}** hours.`);
	}
};
