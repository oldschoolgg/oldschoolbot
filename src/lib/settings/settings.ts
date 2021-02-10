import { Util } from 'discord.js';
import { Gateway, Settings } from 'klasa';

import { client } from '../..';
import { MinigameKey } from '../../extendables/User/Minigame';
import { Emoji } from '../constants';
import { MinigameTable } from '../typeorm/MinigameTable.entity';

export async function getUserSettings(userID: string): Promise<Settings> {
	return (client.gateways.get('users') as Gateway)!
		.acquire({
			id: userID
		})
		.sync(true);
}

export async function getMinigameEntity(userID: string): Promise<MinigameTable> {
	let value = await MinigameTable.findOne({ userID });
	if (!value) {
		value = new MinigameTable();
		value.userID = userID;
		await value.save();
	}
	return value;
}

export async function incrementMinigameScore(
	userID: string,
	minigame: MinigameKey,
	amountToAdd = 1
) {
	const UserMinigames = await getMinigameEntity(userID);
	UserMinigames[minigame] += amountToAdd;
	await UserMinigames.save();
	return UserMinigames[minigame];
}

export async function getMinionName(userID: string): Promise<string> {
	const result = await client.query<{ name?: string; isIronman: boolean; icon?: string }[]>(
		`SELECT "minion.name" as name, "minion.ironman" as isIronman, "minion.icon" as icon FROM users WHERE id = $1;`,
		[userID]
	);
	if (result.length === 0) {
		throw new Error(`No user found in database for minion name.`);
	}

	const [{ name, isIronman, icon }] = result;

	const prefix = isIronman ? Emoji.Ironman : '';

	const displayIcon = icon ?? Emoji.Minion;

	return name
		? `${prefix} ${displayIcon} **${Util.escapeMarkdown(name)}**`
		: `${prefix} ${displayIcon} Your minion`;
}
