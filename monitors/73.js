const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false });
	}

	async run(msg) {
		if (!msg.content.includes(' 73') || !msg.guild) return;
		if (!msg.guild.configs.joyReactions) return;
		msg.react('😂').catch(() => null);
	}

	async init() {
		if (!this.client.gateways.guilds.schema.has('joyReactions')) {
			await this.client.gateways.guilds.schema.add('joyReactions', { type: 'textchannel' });
		}
	}


};
