import { InteractionReplyOptions, TextChannel, User } from 'discord.js';

import { modifyBusyCounter } from '../../lib/busyCounterCache';
import { usernameCache } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { removeMarkdownEmojis } from '../../lib/util';
import { AbstractCommand, runInhibitors } from './inhibitors';

function cleanUsername(username: string) {
	return removeMarkdownEmojis(username).substring(0, 32);
}
export async function syncNewUserUsername(userID: string, username: string) {
	const newUsername = cleanUsername(username);
	const newUser = await prisma.newUser.findUnique({
		where: { id: userID }
	});
	if (!newUser || newUser.username !== newUsername) {
		await prisma.newUser.upsert({
			where: {
				id: userID
			},
			update: {
				username
			},
			create: {
				id: userID,
				username
			}
		});
	}
	usernameCache.set(userID, newUsername);
}

export async function preCommand({
	abstractCommand,
	userID,
	guildID,
	channelID,
	bypassInhibitors,
	apiUser
}: {
	apiUser: User | null;
	abstractCommand: AbstractCommand;
	userID: string;
	guildID?: string | bigint | null;
	channelID: string | bigint;
	bypassInhibitors: boolean;
}): Promise<
	| undefined
	| {
			reason: InteractionReplyOptions;
			silent: boolean;
			dontRunPostCommand?: boolean;
	  }
> {
	if (globalClient.isShuttingDown) {
		return {
			silent: true,
			reason: { content: 'The bot is currently restarting, please try again later.' },
			dontRunPostCommand: true
		};
	}
	const user = await mUserFetch(userID.toString());
	if (user.isBusy && !bypassInhibitors && abstractCommand.name !== 'admin') {
		return { silent: true, reason: { content: 'You cannot use a command right now.' }, dontRunPostCommand: true };
	}
	modifyBusyCounter(userID, 1);
	const guild = guildID ? globalClient.guilds.cache.get(guildID.toString()) : null;
	const member = guild?.members.cache.get(userID.toString());
	const channel = globalClient.channels.cache.get(channelID.toString()) as TextChannel;
	if (apiUser) {
		await syncNewUserUsername(user.id, apiUser.username);
	}
	const inhibitResult = await runInhibitors({
		user,
		APIUser: await globalClient.fetchUser(user.id),
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
