const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			runIn: ['text'],
			description: 'Change the command prefix the bot uses in your server.',
			usage: '[prefix:str{1,3}]'
		});
	}

	async run(msg, [prefix]) {
		if (!prefix) return msg.send(`The current prefix for your guild is: \`${msg.guild.configs.prefix}\``);
		await msg.guild.configs.update('prefix', prefix, msg.guild);
		return msg.send(`Changed Command Prefix for ${msg.guild.name} to ${prefix}`);
	}

};
