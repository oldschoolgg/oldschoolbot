const { Task } = require('klasa');

const badges = require('../../config/badges');

module.exports = class extends Task {
	init() {
		this.run();
	}
	run() {
		this.cacheBadges();
	}

	cacheBadges() {
		const newCache = new Map();

		const usersWithBadges = this.client.users.filter(u => u.settings.get('badges').length > 0);
		for (const user of usersWithBadges.values()) {
			const RSN = user.settings.get('RSN');
			if (!RSN) continue;
			newCache.set(
				RSN.toLowerCase(),
				user.settings
					.get('badges')
					.map(badge => badges[badge])
					.join(' ')
			);
		}

		this.client._badgeCache = newCache;
	}
};
