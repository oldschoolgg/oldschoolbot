import { captureException } from '@sentry/node';
import { Guild, Util } from 'discord.js';
import { Gateway, KlasaClient, Settings } from 'klasa';
import { getConnection } from 'typeorm';

import { client } from '../..';
import { MinigameKey, Minigames } from '../../extendables/User/Minigame';
import { Emoji } from '../constants';
import { ActivityTable } from '../typeorm/ActivityTable.entity';
import { MinigameTable } from '../typeorm/MinigameTable.entity';
import { NewUserTable } from '../typeorm/NewUserTable.entity';
import { ActivityTaskData } from '../types/minions';

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

export async function getNewUser(id: string): Promise<NewUserTable> {
	let value = await NewUserTable.findOne({ id });
	if (!value) {
		value = new NewUserTable();
		value.id = id;
		await value.save();
	}
	return value;
}

export async function syncNewUserUsername(id: string, username: string) {
	let value = await NewUserTable.findOne({ id });
	if (!value) {
		value = new NewUserTable();
		value.id = id;
		value.username = username;
		value.save();
		return;
	}
	value.username = username;
	value.save();
}

export async function batchSyncNewUserUsernames(client: KlasaClient) {
	await getConnection()
		.createQueryBuilder()
		.insert()
		.into(NewUserTable)
		.values(client.users.cache.filter(u => u.hasMinion).map(u => ({ id: u.id, username: u.username })))
		.orUpdate({
			conflict_target: ['id'],
			overwrite: ['username']
		})
		.execute();
}

export async function getMinigameEntity(userID: string): Promise<MinigameTable> {
	let value = await MinigameTable.findOne({ userID });
	if (!value) {
		value = new MinigameTable();
		value.userID = userID;
		try {
			await value.save();
		} catch (err) {
			captureException(err, {
				user: {
					id: userID
				}
			});
		}
	}
	return value;
}

export async function incrementMinigameScore(userID: string, minigame: MinigameKey, amountToAdd = 1) {
	const entity = await getMinigameEntity(userID);
	const game = Minigames.find(m => m.key === minigame)!;

	let previousScore = entity[game.key];

	entity[game.key] += amountToAdd;
	await entity.save();

	return {
		entity,
		newScore: entity[game.key],
		previousScore
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
	await ActivityTable.delete({
		userID,
		completed: false
	});
	minionActivityCache.delete(userID);
}

export async function syncActivityCache() {
	const tasks = await ActivityTable.find({
		where: {
			completed: false
		}
	});
	minionActivityCache.clear();
	for (const task of tasks) {
		for (const u of task.getUsers()) {
			minionActivityCache.set(u, task.taskData);
		}
	}
}
