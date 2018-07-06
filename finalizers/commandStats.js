const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {

	constructor(...args) {
		super(...args, { enabled: true });
	}

	async run(msg) {
		const { name } = msg.command;
		const { commandStats } = this.client.configs;

		if (!commandStats[name]) commandStats[name] = 1;
		else commandStats[name]++;
		this.client.configs.update('commandStats', { ...commandStats });
	}

};
