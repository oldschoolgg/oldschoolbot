import { type CommandOptions, cleanUsername } from '@oldschoolgg/toolkit';
import type { InteractionReplyOptions, TextChannel, User } from 'discord.js';

import { modifyBusyCounter, userIsBusy } from '../../lib/busyCounterCache';
import { busyImmuneCommands } from '../../lib/constants';

import { CACHED_ACTIVE_USER_IDS } from '../../lib/util/cachedUserIDs';
import type { AbstractCommand } from './inhibitors';
import { runInhibitors } from './inhibitors';

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
	options: CommandOptions;
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

	const username = apiUser?.username ? cleanUsername(apiUser?.username) : undefined;
	const user = await mUserFetch(userID, {
		username
	});

	user.checkBankBackground();
	if (userIsBusy(userID) && !bypassInhibitors && !busyImmuneCommands.includes(abstractCommand.name)) {
		return { silent: true, reason: { content: 'You cannot use a command right now.' }, dontRunPostCommand: true };
	}
	if (!busyImmuneCommands.includes(abstractCommand.name)) modifyBusyCounter(userID, 1);

	const guild = guildID ? globalClient.guilds.cache.get(guildID.toString()) : null;
	const member = guild?.members.cache.get(userID.toString());
	const channel = globalClient.channels.cache.get(channelID.toString()) as TextChannel;

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
