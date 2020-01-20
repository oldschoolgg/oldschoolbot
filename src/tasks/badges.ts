import { Task } from 'klasa';

import badges from '../lib/badges';

export default class extends Task {
	async init() {
		this.run();
	}
	async run() {
		this.cacheBadges();
	}

	cacheBadges() {
		const newCache = new Map();

		const usersWithBadges = this.client.users.filter(u => u.settings.get('badges').length > 0);
		for (const user of usersWithBadges.values()) {
			const RSN = user.settings.get('RSN');
			if (!RSN) continue;
			const userBadges = user.settings.get('badges').map((badge: number) => badges[badge]);

			newCache.set(RSN.toLowerCase(), userBadges.join(' '));
		}

		this.client._badgeCache = newCache;
	}
}
