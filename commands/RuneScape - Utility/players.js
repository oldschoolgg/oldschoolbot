const { Command } = require('klasa');
const { get } = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			description: 'Shows how many people are playing OSRS.'
		});
	}

	async run(msg) {
		const playerCount = await get('http://oldschool.runescape.com/slu').then(
			res =>
				res.body
					.toString()
					.split("<p class='player-count'>")[1]
					.split('</p>')[0]
		);
		return msg.send(playerCount);
	}

};
