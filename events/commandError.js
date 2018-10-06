const { Event } = require('klasa');

module.exports = class extends Event {

	run(msg, command, params, error) {
		const { errorLogs } = this.client;

		if (error instanceof Error) {
			errorLogs.send((error.stack || error).slice(0, 1900));
		}

		if (error.message)	{
			errorLogs.send(error.message.slice(0, 1900));
		} else {
			errorLogs.send(error.slice(0, 1900));
		}

		msg.send(`There was an unexpected error. If this persists, please let us know in the support server`);
	}

};
