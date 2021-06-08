import { Task } from 'klasa';

import { badges } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';

export default class extends Task {
	async init() {
		this.run();
	}

	async run() {
		this.cacheBadges();
	}

	cacheBadges() {
		const newCache = new Map();

		const usersWithBadges = this.client.users.cache.filter(
			u => u.settings.get(UserSettings.Badges).length > 0
		);
		for (const user of usersWithBadges.values()) {
			const RSN = user.settings.get(UserSettings.RSN);
			if (!RSN) continue;
			const userBadges = user.settings
				.get(UserSettings.Badges)
				.map((badge: number) => badges[badge]);

			newCache.set(RSN.toLowerCase(), userBadges.join(' '));
		}

		this.client._badgeCache = newCache;
	}
}
