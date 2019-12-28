const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, { description: 'Shows the link for the official OSRS mobile app.' });
	}

	async run(msg) {
		return msg.send(`
<https://oldschool.runescape.com/mobile>

**Play Store:** <https://play.google.com/store/apps/details?id=com.jagex.oldscape.android>
**App Store:** <https://itunes.apple.com/us/app/old-school-runescape/id1269648762>
`);
	}
};
