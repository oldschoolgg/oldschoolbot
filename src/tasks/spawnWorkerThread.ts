import { Task } from 'klasa';

import { OldSchoolBotClient } from '../lib/structures/OldSchoolBotClient';

export default class extends Task {
	async init() {
		this.run();
	}

	run() {
		const terminateCb = async () => {
			await (this.client as OldSchoolBotClient).destroy();
			process.exit(0);
		};

		process.removeAllListeners('SIGTERM');
		process.removeAllListeners('SIGINT');

		process.on('SIGTERM', terminateCb);
		process.on('SIGINT', terminateCb);
	}
}
