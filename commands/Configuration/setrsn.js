const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 0,
			description: 'Set your RuneScape Username, used for other commands.',
			usage: '[rsn:str{1,12}]'
		});
	}

	async run(msg, [RSN]) {
		if (!RSN) return msg.send(`Your current RSN is: \`${msg.author.configs.RSN}\``);
		RSN = RSN.toLowerCase();
		if (!RSN.match('^[A-Za-z0-9]{1}[A-Za-z0-9 -_\u00A0]{0,11}$')) throw 'Invalid username';

		if (msg.author.configs.RSN === RSN) throw `Your RSN is already set to \`${msg.author.configs.RSN}\``;
		if (msg.author.configs.RSN !== null) {
			const previousRSN = msg.author.configs.RSN;
			await msg.author.configs.update('RSN', RSN, msg.author);
			return msg.send(`Changed your RSN from \`${previousRSN}\` to \`${msg.author.configs.RSN}\``);
		}
		await msg.author.configs.update('RSN', RSN, msg.author);
		return msg.send(`Your RSN has been set to: \`${msg.author.configs.RSN}\`.`);
	}

	async init() {
		if (!this.client.gateways.users.schema.has('RSN')) {
			await this.client.gateways.users.schema.add('RSN', { type: 'string' });
		}
	}

};
