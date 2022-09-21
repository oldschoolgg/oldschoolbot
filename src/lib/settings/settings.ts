import { Activity, NewUser, Prisma } from '@prisma/client';
import { APIInteractionGuildMember, ButtonInteraction, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';

import { CommandArgs } from '../../mahoji/lib/inhibitors';
import { postCommand } from '../../mahoji/lib/postCommand';
import { preCommand } from '../../mahoji/lib/preCommand';
import { convertMahojiCommandToAbstractCommand } from '../../mahoji/lib/util';
import { ActivityTaskData } from '../types/minions';
import { channelIsSendable, isGroupActivity } from '../util';
import { logError } from '../util/logError';
import { convertStoredActivityToFlatActivity, prisma } from './prisma';

export * from './minigames';

export async function getNewUser(id: string): Promise<NewUser> {
	const value = await prisma.newUser.findUnique({ where: { id } });
	if (!value) {
		return prisma.newUser.create({
			data: {
				id,
				minigame: {}
			}
		});
	}
	return value;
}

declare global {
	namespace NodeJS {
		interface Global {
			minionActivityCache: Map<string, ActivityTaskData> | undefined;
		}
	}
}
export const minionActivityCache: Map<string, ActivityTaskData> = global.minionActivityCache || new Map();

if (process.env.NODE_ENV !== 'production') global.minionActivityCache = minionActivityCache;

export function getActivityOfUser(userID: string) {
	const task = minionActivityCache.get(userID);
	return task ?? null;
}

export function minionActivityCacheDelete(userID: string) {
	const entry = minionActivityCache.get(userID);
	if (!entry) return;

	const users: string[] = isGroupActivity(entry) ? entry.users : [entry.userID];
	for (const u of users) {
		minionActivityCache.delete(u);
	}
}

export async function cancelTask(userID: string) {
	await prisma.activity.deleteMany({ where: { user_id: BigInt(userID), completed: false } });
	minionActivityCache.delete(userID);
}

export async function runMahojiCommand({
	channelID,
	userID,
	guildID,
	commandName,
	options,
	user,
	interaction
}: {
	interaction: ChatInputCommandInteraction | ButtonInteraction;
	commandName: string;
	options: Record<string, unknown>;
	channelID: string;
	userID: string;
	guildID: string | undefined | null;
	user: MUser;
	member: APIInteractionGuildMember | GuildMember | null;
}) {
	const mahojiCommand = globalClient.mahojiClient.commands.values.find(c => c.name === commandName);
	if (!mahojiCommand) {
		throw new Error(`No mahoji command found for ${commandName}`);
	}

	return mahojiCommand.run({
		userID,
		guildID: guildID ? guildID : undefined,
		channelID,
		options,
		user: globalClient.users.cache.get(user.id)!,
		member: guildID ? globalClient.guilds.cache.get(guildID)?.members.cache.get(user.id) : undefined,
		client: globalClient.mahojiClient,
		interaction: interaction as ChatInputCommandInteraction
	});
}

export interface RunCommandArgs {
	commandName: string;
	args: CommandArgs;
	user: MUser;
	channelID: string;
	member: APIInteractionGuildMember | GuildMember | null;
	isContinue?: boolean;
	bypassInhibitors?: true;
	guildID: string | undefined | null;
	interaction: ButtonInteraction | ChatInputCommandInteraction;
}
export async function runCommand({
	commandName,
	args,
	isContinue,
	bypassInhibitors,
	channelID,
	guildID,
	user,
	member,
	interaction
}: RunCommandArgs): Promise<null | CommandResponse> {
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channel || !channelIsSendable(channel)) return null;
	const mahojiCommand = globalClient.mahojiClient.commands.values.find(c => c.name === commandName);
	if (!mahojiCommand) throw new Error('No command found');
	const abstractCommand = convertMahojiCommandToAbstractCommand(mahojiCommand);

	let error: Error | null = null;
	let inhibited = false;
	try {
		const inhibitedReason = await preCommand({
			abstractCommand,
			userID: user.id,
			channelID,
			guildID,
			bypassInhibitors: bypassInhibitors ?? false,
			apiUser: null
		});

		if (inhibitedReason) {
			inhibited = true;
			if (inhibitedReason.silent) return null;

			await interaction.reply({
				content:
					typeof inhibitedReason.reason! === 'string'
						? inhibitedReason.reason
						: inhibitedReason.reason!.content!,
				ephemeral: true
			});
			return null;
		}

		if (Array.isArray(args)) throw new Error(`Had array of args for mahoji command called ${commandName}`);
		const result = await runMahojiCommand({
			options: args,
			commandName,
			guildID,
			channelID,
			userID: user.id,
			member,
			user,
			interaction
		});
		if (result && interaction.replied) {
			console.log(`Tried to reply twice to interaction, unsent reply was: ${result}`);
		}
		if (result && !interaction.replied) await interaction.reply(result);
		return result;
	} catch (err: any) {
		if (typeof err === 'string') {
			if (channelIsSendable(channel)) {
				channel.send(err);
				return null;
			}
		}
		error = err as Error;
	} finally {
		try {
			await postCommand({
				abstractCommand,
				userID: user.id,
				guildID,
				channelID,
				args,
				error,
				isContinue: isContinue ?? false,
				inhibited
			});
		} catch (err) {
			logError(err);
		}
	}

	return null;
}

export function activitySync(activity: Activity) {
	const users: bigint[] | string[] = isGroupActivity(activity.data)
		? ((activity.data as Prisma.JsonObject).users! as string[])
		: [activity.user_id];
	for (const user of users) {
		minionActivityCache.set(user.toString(), convertStoredActivityToFlatActivity(activity));
	}
}
