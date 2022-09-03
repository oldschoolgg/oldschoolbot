import { TextChannel } from 'discord.js';
import { APIUser } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';

import { BitField, usernameCache } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { removeMarkdownEmojis } from '../../lib/util';
import { mUserFetch } from '../mahojiSettings';
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
	apiUser: APIUser | null;
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
	await prisma.user.findMany({
		where: {
			bitfield: {
				hasSome: [
					BitField.IsPatronTier3,
					BitField.IsPatronTier4,
					BitField.IsPatronTier5,
					BitField.isContributor,
					BitField.isModerator
				]
			},
			farming_patch_reminders: true
		},
		select: {
			id: true,
			bitfield: true
		}
	});
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
