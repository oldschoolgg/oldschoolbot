import { InteractionReplyOptions, TextChannel, User } from 'discord.js';
import { CommandOptions } from 'mahoji/dist/lib/types';

import { modifyBusyCounter, userIsBusy } from '../../lib/busyCounterCache';
import { badges, badgesCache, busyImmuneCommands, Emoji, usernameCache } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { removeMarkdownEmojis, stripEmojis } from '../../lib/util';
import { CACHED_ACTIVE_USER_IDS } from '../../lib/util/cachedUserIDs';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';
import { AbstractCommand, runInhibitors } from './inhibitors';

function cleanUsername(username: string) {
	return removeMarkdownEmojis(username).substring(0, 32);
}
export async function syncNewUserUsername(user: PrecommandUser, username: string) {
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
	usernameCache.set(user.id, name);
	const rawBadges = user.badges.map(num => badges[num]);
	if (user.minion_ironman) {
		rawBadges.push(Emoji.Ironman);
	}
	badgesCache.set(user.id, rawBadges.join(' '));
}

async function fetchPrecommandUser(userID: string) {
	return mahojiUsersSettingsFetch(userID, {
		id: true,
		bitfield: true,
		badges: true,
		minion_hasBought: true,
		minion_ironman: true,
		premium_balance_expiry_date: true,
		premium_balance_tier: true,
		ironman_alts: true,
		main_account: true
	});
}

export type PrecommandUser = Awaited<ReturnType<typeof fetchPrecommandUser>>;

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
	const user: PrecommandUser = await fetchPrecommandUser(userID);
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
