import { Time } from 'e';
import { Task } from 'klasa';

declare module 'klasa' {
	interface KlasaClient {
		_presenceInterval: NodeJS.Timeout;
	}
}

export default class extends Task {
	async init() {
		if (this.client._presenceInterval) {
			clearTimeout(this.client._presenceInterval);
		}
		const set = () => this.client.user?.setActivity('/help');
		this.client._presenceInterval = setInterval(set, Time.Hour);
		set();
	}

	async run() {}
}
