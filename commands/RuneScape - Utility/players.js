const { Command } = require('klasa');
const { get } = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			description: 'Shows how many people are playing OSRS.'
		});
	}

	getPlayerCount() {
		return get('http://oldschool.runescape.com/slu').then(
			res =>
				res.body
					.toString()
					.split("<p class='player-count'>")[1]
					.split('</p>')[0]
					.replace(/\D/g, '')
		);
	}

	getOsbPlayerCount() {
		return get('https://rsbuddy.com/stats.json').then(res => res.body.inGame);
	}

	getRunelitePlayerCount() {
		return get('https://api.runelite.net/runelite-1.4.10.2/session/count').then(res => res.body.toString());
	}

	async run(msg) {
		const [
			total,
			osb,
			runelite
		] = await Promise.all([this.getPlayerCount(), this.getOsbPlayerCount(), this.getRunelitePlayerCount()]);

		return msg.send(`
There are ${parseInt(total).toLocaleString()} players ingame!

**RuneLite:** ${parseInt(runelite).toLocaleString()} clients open
**OSBuddy:** ${osb.toLocaleString()} clients open
`);
	}

};
