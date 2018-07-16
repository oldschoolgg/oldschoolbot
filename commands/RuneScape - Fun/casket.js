const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Random Mod Ash gif.',
			usage: '<easy|medium|elite|master> <quantity:int>',
			usageDelim: ' '
		});
	}

	async run(msg, [tier, quantity]) {
		if (tier !== 'master') return msg.send('Only Master Clue scrolls are available at the moment!');
		if (quantity > 100) return msg.send('I can only do 100 Master Clues at a time!');
		const master = require('../../resources/clues/master');
		const loot = master.open(quantity);
		return msg.send(loot.length > 0 ? loot : 'You got nothing.');
	}

};
