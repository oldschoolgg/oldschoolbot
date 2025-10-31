import type { Prisma } from '@/prisma/main.js';

async function mahojiGuildSettingsFetch(guildId: string) {
	const result = await prisma.guild.upsert({
		where: {
			id: guildId
		},
		update: {},
		create: {
			id: guildId
		},
		select: {
			disabledCommands: true,
			id: true,
			petchannel: true,
			staffOnlyChannels: true
		}
	});
	return result;
}

async function mahojiGuildSettingsUpdate(guildId: string, data: Prisma.GuildUpdateArgs['data']) {
	const newGuild = await prisma.guild.update({
		data,
		where: {
			id: guildId
		}
	});
	return { newGuild };
}

const GuildSettingsSrc = {
	fetch: mahojiGuildSettingsFetch,
	update: mahojiGuildSettingsUpdate
};

declare global {
	var GuildSettings: typeof GuildSettingsSrc;
}

global.GuildSettings = GuildSettingsSrc;
