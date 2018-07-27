const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Send virtual GP to people (not real GP).',
			usage: '<user:user> <amount:int{1,2147483647}>',
			usageDelim: ' '
		});
	}

	async run(msg, [user, amount]) {
		const { GP } = msg.author.configs;
		if (GP < amount) throw `You don't have enough GP.`;
		msg.author.configs.update('GP', GP - amount);
		user.configs.update('GP', user.configs.GP + amount);
	}

};
