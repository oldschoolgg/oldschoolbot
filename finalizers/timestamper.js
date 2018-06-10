const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	run(msg) {
		if (msg.guild) msg.guild.configs.update('lastCommandTS', msg.createdTimestamp, msg.guild);
	}
	async init() {
		if (!this.client.gateways.guilds.schema.has('lastCommandTS')) {
			await this.client.gateways.guilds.schema.add('lastCommandTS', { type: 'integer' });
		}
	}

};
