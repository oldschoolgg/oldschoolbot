import type { CommandOptions } from '@oldschoolgg/toolkit';
import type { InteractionReplyOptions, TextChannel, User } from 'discord.js';

import { modifyBusyCounter, userIsBusy } from '../../lib/busyCounterCache';
import { Emoji, badges, badgesCache, busyImmuneCommands, usernameCache } from '../../lib/constants';

import { removeMarkdownEmojis, stripEmojis } from '../../lib/util';
import { CACHED_ACTIVE_USER_IDS } from '../../lib/util/cachedUserIDs';
import type { AbstractCommand } from './inhibitors';
import { runInhibitors } from './inhibitors';

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
	const name = stripEmojis(username);
	usernameCache.set(user.id, name);
	const rawBadges = user.user.badges.map(num => badges[num]);
	if (user.isIronman) {
		rawBadges.push(Emoji.Ironman);
	}
	badgesCache.set(user.id, rawBadges.join(' '));
}

export async function preCommand({
	abstractCommand,
	userID,
	guildID,
	channelID,
	bypassInhibitors,
	apiUser,
	options
}: {
	apiUser: User | null;
	abstractCommand: AbstractCommand;
	userID: string;
	guildID?: string | bigint | null;
	channelID: string | bigint;
	bypassInhibitors: boolean;
	options: CommandOptions;
}): Promise<
	| undefined
	| {
			reason: InteractionReplyOptions;
			silent: boolean;
			dontRunPostCommand?: boolean;
	  }
> {
	debugLog('Attempt to run command', {
		type: 'RUN_COMMAND',
		command_name: abstractCommand.name,
		user_id: userID,
		guild_id: guildID,
		channel_id: channelID,
		options
	});
	CACHED_ACTIVE_USER_IDS.add(userID);
	if (globalClient.isShuttingDown) {
		return {
			silent: true,
			reason: { content: 'The bot is currently restarting, please try again later.' },
			dontRunPostCommand: true
		};
	}
	const user = await mUserFetch(userID);
	user.checkBankBackground();
	if (userIsBusy(userID) && !bypassInhibitors && !busyImmuneCommands.includes(abstractCommand.name)) {
		return { silent: true, reason: { content: 'You cannot use a command right now.' }, dontRunPostCommand: true };
	}
	if (!busyImmuneCommands.includes(abstractCommand.name)) modifyBusyCounter(userID, 1);

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
		channel: channel ?? null,
		bypassInhibitors
	});

	if (inhibitResult !== undefined) {
		debugLog('Command inhibited', {
			type: 'COMMAND_INHIBITED',
			command_name: abstractCommand.name,
			user_id: userID,
			guild_id: guildID,
			channel_id: channelID
		});
		return inhibitResult;
	}
}
