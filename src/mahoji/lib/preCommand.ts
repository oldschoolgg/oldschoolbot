import { TextChannel } from 'discord.js';

import { client } from '../..';
import { AbstractCommand, runInhibitors } from './inhibitors';

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
