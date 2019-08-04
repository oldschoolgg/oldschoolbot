const { Command } = require('klasa');

const clues = {
	master: require('../../../data/clues/master'),
	medium: require('../../../data/clues/medium')
};

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Simulate rare drops from clue scrolls',
			usage: '<medium|master> <quantity:int>',
			cooldown: 1,
			usageDelim: ' '
		});
	}

	async run(msg, [tier, quantity]) {
		if (quantity > 100) return msg.send(`I can only do 100 ${tier} clues at a time!`);
		const loot = clues[tier].open(quantity);
		return msg.send(loot.length > 0 ? loot : "You didn't get any rares.");
	}
};
