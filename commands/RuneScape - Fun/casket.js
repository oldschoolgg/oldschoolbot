const { Command } = require('klasa');
const master = require('../../resources/clues/master');
const medium = require('../../resources/clues/medium');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Simulate rare drops from clue scrolls',
			usage: '<easy|medium|elite|master> <quantity:int>',
			usageDelim: ' '
		});
	}

	async run(msg, [tier, quantity]) {
		if (quantity > 100) return msg.send('I can only do 100 Clues at a time!');
		const loot = [tier].open(quantity);
		return msg.send(loot.length > 0 ? loot : 'You got nothing.');
	}

};
