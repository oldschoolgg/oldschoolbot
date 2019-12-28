const { Monitor } = require('klasa');

module.exports = class extends Monitor {
	constructor(...args) {
		super(...args, { enabled: true, ignoreOthers: false });
	}

	async run(msg) {
		if (!msg.guild || !msg.guild.settings.get('joyReactions')) return;
		if (msg.content.includes(' 73') || msg.content === '73') {
			msg.react('😂').catch(() => null);
		}
	}
};
