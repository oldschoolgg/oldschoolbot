import { LRUCache } from 'lru-cache';

import { assert } from '../../lib/util';

class CooldownsSingleton {
	cooldownMap = new LRUCache<string, Map<string, number>>({ max: 1000 });

	get(userID: string, key: string, cooldown: number): number | null {
		const map = this.cooldownMap.get(userID);
		if (!map) {
			this.cooldownMap.set(userID, new Map());
			return this.get(userID, key, cooldown);
		}
		const value = map.get(key);
		const now = Date.now();
		if (!value || value <= now) {
			map.set(key, now + cooldown);
			return null;
		}

		assert(value > now);
		return value - now;
	}

	delete(userID: string) {
		this.cooldownMap.delete(userID);
	}
}

export const Cooldowns = new CooldownsSingleton();
