import { TextChannel } from 'discord.js';

import { client } from '../..';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';
import { AbstractCommand, runInhibitors } from './inhibitors';

async function cacheLinkedUsers(user_id: bigint | string) {
	const user = await mahojiUsersSettingsFetch(user_id);
	let main = user.main_account;
	const allAccounts: string[] = [...user.ironman_alts];
	if (main) {
		allAccounts.push(main);
	}
	// Ensure linked users are cached
	const allAccountsMap = await Promise.all(
		allAccounts.map(id => client.users.cache.get(id) ?? client.fetchUser(id))
	);
	return allAccountsMap.length;
}
export async function preCommand({
	abstractCommand,
	userID,
	guildID,
	channelID,
	bypassInhibitors
}: {
	abstractCommand: AbstractCommand;
	userID: string;
	guildID?: string | null;
	channelID: string;
	bypassInhibitors: boolean;
}): Promise<{ silent: boolean; reason: string } | undefined> {
	client.emit('debug', `${userID} trying to run ${abstractCommand.name} command`);
	const user = await client.fetchUser(userID);
	if (user.isBusy && !bypassInhibitors && !client.owners.has(user)) {
		return { silent: true, reason: 'You cannot use a command right now.' };
	}
	client.oneCommandAtATimeCache.add(userID);
	const guild = guildID ? client.guilds.cache.get(guildID) : null;
	const member = guild?.members.cache.get(userID);
	const channel = client.channels.cache.get(channelID) as TextChannel;
	await cacheLinkedUsers(userID);
	const inhibitResult = await runInhibitors({
		user,
		guild: guild ?? null,
		member: member ?? null,
		command: abstractCommand,
		channel: channel ?? null,
		bypassInhibitors
	});

	if (inhibitResult !== undefined) {
		return inhibitResult;
	}
}
