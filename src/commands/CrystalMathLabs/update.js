const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: 'Update a CML profile.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			enabled: false
		});
	}

	async run(msg, [username]) {
		fetch(
			`https://crystalmathlabs.com/tracker/update.php?player=${encodeURIComponent(username)}`
		);

		return msg.send(`Sent a request to update \`${username}\`.`);
	}
};
