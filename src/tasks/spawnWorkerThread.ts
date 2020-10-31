import { Task } from 'klasa';
import { Pool, spawn, Worker } from 'threads';

import { OldSchoolBotClient } from '../lib/structures/OldSchoolBotClient';

export default class extends Task {
	async init() {
		this.run();
	}

	run() {
		this.client.killWorkerThread = Pool(() => spawn(new Worker('../lib/killWorker')), 8);

		const terminateCb = async () => {
			await this.client.killWorkerThread.terminate();
			(this.client as OldSchoolBotClient).destroy();
			process.exit(0);
		};

		process.removeAllListeners('SIGTERM');
		process.removeAllListeners('SIGINT');

		process.on('SIGTERM', terminateCb);
		process.on('SIGINT', terminateCb);
	}
}
