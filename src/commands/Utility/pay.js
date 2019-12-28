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
		const GP = msg.author.settings.get('GP');
		if (GP < amount) throw `You don't have enough GP.`;
		if (user.id === msg.author.id) throw `You can't send money to yourself.`;
		if (user.bot) throw `You can't send money to a bot.`;
		msg.author.settings.update('GP', GP - amount);
		user.settings.update('GP', user.settings.get('GP') + amount);
		return msg.send(`You sent ${amount.toLocaleString()} GP to ${user}.`);
	}
};
