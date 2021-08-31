import { minigames, new_users, Prisma } from '@prisma/client';
import { Guild, Util } from 'discord.js';
import { Gateway, Settings } from 'klasa';

import { client } from '../..';
import { Minigame } from '../../extendables/User/Minigame';
import { Emoji } from '../constants';
import { ActivityTaskData } from '../types/minions';
import { activitySync, prisma } from './prisma';

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

export async function getNewUser(id: string): Promise<new_users> {
	const value = await prisma.new_users.findUnique({ where: { id } });
	if (!value) {
		return prisma.new_users.create({
			data: {
				id,
				minigames: {}
			}
		});
	}
	return value;
}

export async function syncNewUserUsername(id: string, username: string) {
	return prisma.new_users.update({ where: { id }, data: { username } });
}

export async function getMinigameEntity(userID: string): Promise<minigames> {
	const value = await prisma.minigames.findUnique({ where: { user_id: userID } });
	if (!value) {
		return prisma.minigames.create({
			data: {
				user_id: userID
			}
		});
	}
	return value;
}

export async function incrementMinigameScore(userID: string, minigame: Minigame['column'], amountToAdd = 1) {
	const result = await prisma.minigames.update({
		where: { user_id: userID },
		data: { [minigame]: { increment: amountToAdd } }
	});

	return {
		newScore: result[minigame],
		entity: result
	};
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
