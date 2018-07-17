const { Command } = require('klasa');
const clues = {
	master: require('../../resources/clues/master'),
	medium: require('../../resources/clues/medium')
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Simulate rare drops from clue scrolls',
			usage: '<medium|master> <quantity:int>',
			usageDelim: ' '
		});
	}

	async run(msg, [tier, quantity]) {
		if (quantity > 100) return msg.send('I can only do 100 Clues at a time!');
		const loot = clues[tier].open(quantity);
		return msg.send(loot.length > 0 ? loot : 'You got nothing.');
	}

};
