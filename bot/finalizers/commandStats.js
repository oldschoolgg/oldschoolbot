const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {
	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(msg) {
		if (!msg.command) return;
		const { name } = msg.command;
		const commandStats = this.client.settings.get('commandStats');

		if (!commandStats[name]) commandStats[name] = 1;
		else commandStats[name]++;
		this.client.settings.update('commandStats', { ...commandStats });
	}
};
