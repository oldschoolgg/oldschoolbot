import { NewUser, Prisma } from '@prisma/client';
import { Guild, Util } from 'discord.js';
import { Gateway, Settings } from 'klasa';

import { client } from '../..';
import { Emoji } from '../constants';
import { ActivityTaskData } from '../types/minions';
import { activitySync, prisma } from './prisma';

export * from './minigames';

const guildSettingsCache = new Map<string, Settings>();

export async function getGuildSettings(guild: Guild) {
	const cached = guildSettingsCache.get(guild.id);
	if (cached) return cached;
	const gateway = (guild.client.gateways.get('guilds') as Gateway)!;
	const settings = await gateway.acquire(guild);
	gateway.cache.set(guild.id, { settings });
	guildSettingsCache.set(guild.id, settings);
	return settings;
}

export function getGuildSettingsCached(guild: Guild) {
	return guildSettingsCache.get(guild.id);
}

export async function getUserSettings(userID: string): Promise<Settings> {
	return (client.gateways.get('users') as Gateway)!
		.acquire({
			id: userID
		})
		.sync(true);
}

export async function getNewUser(id: string): Promise<NewUser> {
	const value = await prisma.newUser.findUnique({ where: { id } });
	if (!value) {
		return prisma.newUser.create({
			data: {
				id,
				minigame: {}
			}
		});
	}
	return value;
}

export async function syncNewUserUsername(id: string, username: string) {
	return prisma.newUser.update({ where: { id }, data: { username } });
}

export async function getMinionName(userID: string): Promise<string> {
	const result = await client.query<{ name?: string; isIronman: boolean; icon?: string }[]>(
		'SELECT "minion.name" as name, "minion.ironman" as isIronman, "minion.icon" as icon FROM users WHERE id = $1;',
		[userID]
	);
	if (result.length === 0) {
		throw new Error('No user found in database for minion name.');
	}

	const [{ name, isIronman, icon }] = result;

	const prefix = isIronman ? Emoji.Ironman : '';

	const displayIcon = icon ?? Emoji.Minion;

	return name ? `${prefix} ${displayIcon} **${Util.escapeMarkdown(name)}**` : `${prefix} ${displayIcon} Your minion`;
}

export const minionActivityCache = new Map<string, ActivityTaskData>();
export function getActivityOfUser(userID: string) {
	const task = minionActivityCache.get(userID);
	return task ?? null;
}

export async function cancelTask(userID: string) {
	prisma.activity.deleteMany({ where: { user_id: userID, completed: false } });
	minionActivityCache.delete(userID);
}

export async function syncActivityCache() {
	const tasks = await prisma.activity.findMany({ where: { completed: false } });

	minionActivityCache.clear();
	for (const task of tasks) {
		activitySync(task);
	}
}

export function settingsUpdate(type: Prisma.ModelName, id: string, newData: any) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return prisma[type].update({ where: { id }, data: newData });
}
