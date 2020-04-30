import { Task } from 'klasa';

function formatDuration(ms: number) {
	if (ms < 0) ms = -ms;
	const time = {
		hour: Math.floor(ms / 3600000) % 24,
		minute: Math.floor(ms / 60000) % 60
	};
	return Object.entries(time)
		.filter(val => val[1] !== 0)
		.map(([key, val]) => `${val}${key.charAt(0)}`)
		.join(' ');
}

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		const diff = Date.now() - 1588334400 * 1000;
		console.log(diff);
		const remaining = diff < 0 ? formatDuration(diff) : 'NOW!';
		this.client.user?.setActivity(`DMM in ${remaining}`);
	}
}
