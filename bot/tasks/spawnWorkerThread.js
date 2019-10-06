const { Task } = require('klasa');
const { spawn, Thread, Worker } = require('threads');

module.exports = class extends Task {
	async run() {
		if (this.client.killWorkerThread) {
			Thread.terminate(this.client.killWorkerThread);
		}
		this.client.killWorkerThread = await spawn(
			new Worker('../../data/new_monsters/killWorkerFunction')
		).catch(console.error);

		const terminateCb = async () => {
			Thread.terminate(this.client.killWorkerThread);
			process.exit(0);
		};

		process.on('SIGTERM', terminateCb);
		process.on('SIGINT', terminateCb);
	}
};
