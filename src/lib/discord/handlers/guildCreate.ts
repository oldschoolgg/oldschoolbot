import type { GatewayGuildCreateDispatchData } from '@oldschoolgg/discord';

import { globalConfig } from '@/lib/constants.js';

export function onRawGuildCreate(g: GatewayGuildCreateDispatchData) {
	if (!globalConfig.guildsIdsToCache.includes(g.id)) return;

	// TODO
	// for (const role of g.roles) {
	// 	Cache.MAIN_SERVER.ROLES.set(role.id, role);
	// }
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
