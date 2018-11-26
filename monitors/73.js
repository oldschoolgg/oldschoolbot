const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false });
	}

	async run(msg) {
		if (!msg.guild || !msg.guild.configs.joyReactions) return;
		if (msg.cleanContent().replace(/<a?:.*?:[0-9]+>/g, '').includes('73')) {
			msg.react('😂').catch(() => null);
		}
	}

	async init() {
		if (!this.client.gateways.guilds.schema.has('joyReactions')) {
			await this.client.gateways.guilds.schema.add('joyReactions', { type: 'textchannel' });
		}
	}


};
