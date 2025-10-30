import type { GatewayGuildCreateDispatchData } from 'discord-api-types/v10';

import { Cache } from '@/lib/cache.js';
import { globalConfig } from '@/lib/constants.js';

export function onRawGuildCreate(g: GatewayGuildCreateDispatchData) {
	if (!globalConfig.guildsIdsToCache.includes(g.id)) return;
	for (const role of g.roles) {
		Cache.MAIN_SERVER.ROLES.set(role.id, role);
	}
	for (const ch of g.channels) {
		Cache.MAIN_SERVER.CHANNELS.set(ch.id, ch);
	}
	console.log(`Cache: ${Cache.MAIN_SERVER.CHANNELS.size}x channels, ${Cache.MAIN_SERVER.ROLES.size}x roles`);
}
