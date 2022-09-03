import { Time } from 'e';
import { Task } from 'klasa';

export default class extends Task {
	async init() {
		if (globalClient._presenceInterval) {
			clearTimeout(globalClient._presenceInterval);
		}
		const set = () => globalClient.user?.setActivity('/help');
		globalClient._presenceInterval = setInterval(set, Time.Hour);
		set();
	}

	async run() {}
}
