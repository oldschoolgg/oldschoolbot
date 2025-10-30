import type { GatewayGuildCreateDispatchData } from 'discord-api-types/v10';

import { Cache } from '@/lib/cache/redis.js';
import { globalConfig } from '@/lib/constants.js';

export function onRawGuildCreate(g: GatewayGuildCreateDispatchData) {
	if (!globalConfig.guildsIdsToCache.includes(g.id)) return;
	// for (const role of g.roles) {
	// 	Cache.MAIN_SERVER.ROLES.set(role.id, role);
	// }
	Cache.bulkSetChannels(
		g.channels.map(c => ({
			id: c.id,
			guild_id: g.id,
			name: c.name,
			type: c.type
		}))
	);
	Cache.bulkSetEmojis(
		g.emojis
			.filter(e => e.id !== null)
			.map(c => ({
				id: c.id!,
				guild_id: g.id,
				name: c.name
			}))
	);
	// console.log(`Cache: ${Cache.MAIN_SERVER.CHANNELS.size}x channels, ${Cache.MAIN_SERVER.ROLES.size}x roles`);
}
