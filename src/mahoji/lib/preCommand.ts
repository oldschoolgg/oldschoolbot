import { TextChannel } from 'discord.js';

import { client } from '../..';
import { AbstractCommand, runInhibitors } from './inhibitors';

export async function preCommand({
	abstractCommand,
	userID,
	guildID,
	channelID
}: {
	abstractCommand: AbstractCommand;
	userID: string;
	guildID: string | null;
	channelID: string;
}): Promise<string | undefined> {
	const user = await client.fetchUser(userID);
	const guild = guildID ? client.guilds.cache.get(guildID) : null;
	const member = guild?.members.cache.get(userID);
	const channel = client.channels.cache.get(channelID) as TextChannel;
	const inhibitResult = await runInhibitors({
		user,
		guild: guild ?? null,
		member: member ?? null,
		command: abstractCommand,
		channel: channel ?? null
	});

	if (typeof inhibitResult === 'string') {
		return inhibitResult;
	}

	if (abstractCommand.attributes?.oneAtTime) {
		client.oneCommandAtATimeCache.add(userID);
	}
}
