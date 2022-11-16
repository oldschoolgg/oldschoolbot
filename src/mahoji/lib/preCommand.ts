import { InteractionReplyOptions, TextChannel, User } from 'discord.js';

import { modifyBusyCounter } from '../../lib/busyCounterCache';
import { badges, Emoji, usernameCache } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { removeMarkdownEmojis, stripEmojis } from '../../lib/util';
import { CACHED_ACTIVE_USER_IDS } from '../../lib/util/cachedUserIDs';
import { AbstractCommand, CommandArgs, runInhibitors } from './inhibitors';

function cleanUsername(username: string) {
	return removeMarkdownEmojis(username).substring(0, 32);
}
export async function syncNewUserUsername(user: MUser, username: string) {
	const newUsername = cleanUsername(username);
	const newUser = await prisma.newUser.findUnique({
		where: { id: user.id }
	});
	if (!newUser || newUser.username !== newUsername) {
		await prisma.newUser.upsert({
			where: {
				id: user.id
			},
			update: {
				username
			},
			create: {
				id: user.id,
				username
			}
		});
	}
	let name = stripEmojis(username);
	const rawBadges = user.user.badges.map(num => badges[num]);
	if (user.isIronman) {
		rawBadges.push(Emoji.Ironman);
	}
	name = `${rawBadges.join(' ')} ${name}`;

	usernameCache.set(user.id, name);
}

export async function preCommand({
	abstractCommand,
	args,
	userID,
	guildID,
	channelID,
	bypassInhibitors,
	apiUser
}: {
	apiUser: User | null;
	abstractCommand: AbstractCommand;
	args?: CommandArgs;
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
	CACHED_ACTIVE_USER_IDS.add(userID);
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
		await syncNewUserUsername(user, apiUser.username);
	}
	const inhibitResult = await runInhibitors({
		user,
		APIUser: await globalClient.fetchUser(user.id),
		guild: guild ?? null,
		member: member ?? null,
		command: abstractCommand,
		args: args ?? null,
		channel: channel ?? null,
		bypassInhibitors
	});

	if (inhibitResult !== undefined) {
		return inhibitResult;
	}
}
