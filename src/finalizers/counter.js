const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {
	constructor(...args) {
		super(...args, { enabled: false });
	}

	run(msg) {
		msg.author.settings.update(
			'totalCommandsUsed',
			msg.author.settings.get('totalCommandsUsed') + 1,
			msg.author
		);

		this.client.settings.update(
			'totalCommandsUsed',
			this.client.settings.get('totalCommandsUsed') + 1,
			this.client
		);

		if (msg.guild) {
			msg.guild.settings.update(
				'totalCommandsUsed',
				msg.guild.settings.get('totalCommandsUsed') + 1,
				msg.guild
			);
		}
	}
};
