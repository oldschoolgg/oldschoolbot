const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 7,
			runIn: ['text'],
			description: 'Change the command prefix the bot uses in your server.',
			usage: '[prefix:str{1,3}]'
		});
	}

	async run(msg, [prefix]) {
		if (!prefix) return msg.sendLocale('PREFIX_CURRENT', [msg.guild.settings.get('prefix')]);
		await msg.guild.settings.update('prefix', prefix);
		return msg.sendLocale('PREFIX_CHANGED', [msg.guild.name, prefix]);
	}

};
