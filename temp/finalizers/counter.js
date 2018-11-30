const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	run(msg) {
		msg.author.configs.update('totalCommandsUsed', msg.author.configs.totalCommandsUsed + 1, msg.author);
		this.client.configs.update('totalCommandsUsed', this.client.configs.totalCommandsUsed + 1, this.client);
		if (msg.guild) msg.guild.configs.update('totalCommandsUsed', msg.guild.configs.totalCommandsUsed + 1, msg.guild);
	}

	async init() {
		if (!this.client.gateways.clientStorage.schema.has('totalCommandsUsed')) {
			await this.client.gateways.clientStorage.schema.add('totalCommandsUsed', { type: 'integer' });
		}

		if (!this.client.gateways.users.schema.has('totalCommandsUsed')) {
			await this.client.gateways.users.schema.add('totalCommandsUsed', { type: 'integer' });
		}

		if (!this.client.gateways.guilds.schema.has('totalCommandsUsed')) {
			await this.client.gateways.guilds.schema.add('totalCommandsUsed', { type: 'integer' });
		}
	}

};
