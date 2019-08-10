const { Finalizer } = require('klasa');

module.exports = class extends Finalizer {
	run(message, command) {
		if (command.cooldown <= 0 || message.author === this.client.owner) return;

		try {
			command.cooldowns.acquire(message.levelID).drip();
		} catch (err) {
			//
		}
	}
};
