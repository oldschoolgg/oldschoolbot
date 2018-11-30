const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Automatically update your connected (+setrsn) account on CML every hour.'
		});
	}

	async run(msg) {
		if (!msg.author.settings.get('RSN')) {
			throw 'You must have an RSN set to Autoupdate. Use `+setrsn <username>`';
		}
		await msg.author.settings.update('autoupdate', !msg.author.settings.get('autoupdate'));
		return msg.send(`Turned Auto Updating for your account ${msg.author.settings.get('autoupdate') ? '**on**.' : '**off**.'}`);
	}

};
