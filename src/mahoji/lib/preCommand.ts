import { TextChannel } from 'discord.js';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';

import { mahojiUsersSettingsFetch, mUserFetch } from '../mahojiSettings';
import { AbstractCommand, runInhibitors } from './inhibitors';

async function cacheLinkedUsers(user_id: bigint | string) {
	const user = await mahojiUsersSettingsFetch(user_id);
	let main = user.main_account;
	const allAccounts: string[] = [...user.ironman_alts];
	if (main) {
		allAccounts.push(main);
	}
	// Ensure linked users are cached
	const allAccountsMap = await Promise.all(allAccounts.map(id => globalClient.fetchUser(id)));
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
	userID: string | bigint;
	guildID?: string | bigint | null;
	channelID: string | bigint;
	bypassInhibitors: boolean;
}): Promise<{ silent: boolean; reason: Awaited<CommandResponse> } | undefined> {
	globalClient.emit('debug', `${userID} trying to run ${abstractCommand.name} command`);
	const user = await mUserFetch(userID);
	const klasaUser = await globalClient.fetchUser(userID);
	if (user.isBusy && !bypassInhibitors && !globalClient.owners.has(klasaUser)) {
		return { silent: true, reason: 'You cannot use a command right now.' };
	}
	globalClient.oneCommandAtATimeCache.add(userID.toString());
	const guild = guildID ? globalClient.guilds.cache.get(guildID.toString()) : null;
	const member = guild?.members.cache.get(userID.toString());
	const channel = globalClient.channels.cache.get(channelID.toString()) as TextChannel;
	await cacheLinkedUsers(userID);
	const inhibitResult = await runInhibitors({
		user,
		klasaUser,
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
