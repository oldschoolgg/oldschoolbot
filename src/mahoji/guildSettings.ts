import type { Guild } from '@prisma/client';
import type { Guild as DJSGuild } from 'discord.js';
import { LRUCache } from 'lru-cache';

type CachedGuild = Pick<Guild, 'disabledCommands' | 'id'>;
export const untrustedGuildSettingsCache = new LRUCache<string, CachedGuild>({ max: 1000 });

export async function mahojiGuildSettingsFetch(guild: string | DJSGuild) {
	const id = typeof guild === 'string' ? guild : guild.id;
	const result = await prisma.guild.upsert({
		where: {
			id
		},
		update: {},
		create: {
			id
		},
		select: {
			disabledCommands: true,
			id: true
		}
	});
	untrustedGuildSettingsCache.set(id, result);
	return result;
}
