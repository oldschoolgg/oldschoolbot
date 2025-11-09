import type { GatewayGuildCreateDispatchData } from '@oldschoolgg/discord';

import { globalConfig } from '@/lib/constants.js';

export function onRawGuildCreate(g: GatewayGuildCreateDispatchData) {
	if (!globalConfig.guildIdsToCache.includes(g.id)) return;

	Cache.bulkSetEmojis(
		g.emojis
			.filter(e => e.id !== null)
			.map(c => ({
				id: c.id!,
				guild_id: g.id,
				name: c.name
			}))
	);
}
