import { Guild, Prisma } from '@prisma/client';
import { Guild as DJSGuild } from 'discord.js';
import LRUCache from 'lru-cache';

import { prisma } from '../lib/settings/prisma';

export const untrustedGuildSettingsCache = new LRUCache<string, Guild>({ max: 5000 });

export async function mahojiGuildSettingsFetch(guild: string | DJSGuild) {
	const id = typeof guild === 'string' ? guild : guild.id;
	const result = await prisma.guild.upsert({
		where: {
			id
		},
		update: {},
		create: {
			id
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
