const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows some support links for RuneScape.'
		});
	}

	async run(msg) {
		return msg.send(`
**RuneScape Support:** <https://support.runescape.com>
**Account Support:** <https://support.runescape.com/hc/en-gb/categories/200977391-Your-account>
**Payments & Membership Support:** <https://support.runescape.com/hc/en-gb/categories/200977401-Payments-and-membership>
**Support Guides:** <https://support.runescape.com/hc/en-gb/categories/200835065-Support-Guides-Updates>
`);
	}

};
