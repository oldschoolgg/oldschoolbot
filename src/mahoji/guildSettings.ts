import type { Guild, Prisma } from '@prisma/client';
import type { Guild as DJSGuild } from 'discord.js';
import { LRUCache } from 'lru-cache';

type CachedGuild = Pick<Guild, 'disabledCommands' | 'id' | 'petchannel' | 'staffOnlyChannels'>;
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
			id: true,
			petchannel: true,
			staffOnlyChannels: true
		}
	});
	untrustedGuildSettingsCache.set(id, result);
	return result;
}

export async function mahojiGuildSettingsUpdate(guild: string | DJSGuild, data: Prisma.GuildUpdateArgs['data']) {
	const guildID = typeof guild === 'string' ? guild : guild.id;

	const newGuild = await prisma.guild.update({
		data,
		where: {
			id: guildID
		}
	});
	untrustedGuildSettingsCache.set(newGuild.id, newGuild);
	return { newGuild };
}
