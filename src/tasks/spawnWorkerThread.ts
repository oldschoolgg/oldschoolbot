import { Task } from 'klasa';

export default class extends Task {
	async init() {
		this.run();
	}

	run() {
		const terminateCb = async () => {
			await globalClient.destroy();
			process.exit(0);
		};

		process.removeAllListeners('SIGTERM');
		process.removeAllListeners('SIGINT');

		process.on('SIGTERM', terminateCb);
		process.on('SIGINT', terminateCb);
	}
}
