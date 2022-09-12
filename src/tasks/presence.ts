import { Time } from 'e';
import { Task } from 'klasa';

import { DOUBLE_LOOT_FINISH_TIME_CACHE, isDoubleLootActive, syncDoubleLoot } from '../lib/doubleLoot';
import { formatDuration } from '../lib/util';

declare module 'klasa' {
	interface KlasaClient {
		_presenceInterval: NodeJS.Timeout;
	}
}

export async function syncPrescence() {
	await syncDoubleLoot();

	let str = isDoubleLootActive()
		? `${formatDuration(DOUBLE_LOOT_FINISH_TIME_CACHE - Date.now(), true)} Double Loot!`
		: '/help';
	if (globalClient.user!.presence.activities[0]?.name !== str) {
		globalClient.user?.setActivity(str);
	}
}

export default class extends Task {
	async init() {
		if (this.client._presenceInterval) {
			clearTimeout(this.client._presenceInterval);
		}

		this.client._presenceInterval = setInterval(syncPrescence, Time.Minute);
		syncPrescence();
	}

	async run() {}
}
