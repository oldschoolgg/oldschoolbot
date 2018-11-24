const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Automatically update your connected (+setrsn) account on CML every hour.'
		});
	}

	async run(msg) {
		if (!msg.author.configs.RSN) throw 'You must have an RSN set to Autoupdate. Use `+setrsn <username>`';
		await msg.author.configs.update('autoupdate', !msg.author.configs.autoupdate, msg.author);
		return msg.send(`Turned Auto Updating for your account ${msg.author.configs.autoupdate ? '**on**.' : '**off**.'}`);
	}

	async init() {
		if (!this.client.gateways.users.schema.has('autoupdate')) {
			await this.client.gateways.users.schema.add('autoupdate', { type: 'boolean' });
		}
	}

};
