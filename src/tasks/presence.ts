import { Time } from 'e';
import { Task } from 'klasa';

import { DOUBLE_LOOT_ACTIVE } from '../lib/constants';

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
		let str = DOUBLE_LOOT_ACTIVE ? 'Double Loot is active!' : `${this.client.options.prefix}info`;
		const set = () => this.client.user?.setActivity(str);
		this.client._presenceInterval = setInterval(set, Time.Hour);
		set();
	}

	async run() {}
}
