import { Time } from 'e';
import { Task } from 'klasa';

import { isDoubleLootActive } from '../lib/doubleLoot';

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

		const set = () => {
			let str = isDoubleLootActive(this.client, 0)
				? 'Double Loot is active!'
				: `${this.client.options.prefix}info`;
			if (this.client.user!.presence.activities[0]?.name !== str) {
				this.client.user?.setActivity(str);
			}
		};

		this.client._presenceInterval = setInterval(set, Time.Minute);
		set();
	}

	async run() {}
}
