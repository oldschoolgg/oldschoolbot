import { Activity, NewUser, Prisma } from '@prisma/client';
import { GuildMember, MessageAttachment } from 'discord.js';
import { roll } from 'e';
import { KlasaMessage } from 'klasa';
import { APIInteractionGuildMember } from 'mahoji';

import { CommandArgs } from '../../mahoji/lib/inhibitors';
import { postCommand } from '../../mahoji/lib/postCommand';
import { preCommand } from '../../mahoji/lib/preCommand';
import {
	convertAPIEmbedToDJSEmbed,
	convertComponentDJSComponent,
	convertKlasaCommandToAbstractCommand,
	convertMahojiCommandToAbstractCommand
} from '../../mahoji/lib/util';
import { BotCommand } from '../structures/BotCommand';
import { ActivityTaskData } from '../types/minions';
import { channelIsSendable, cleanUsername, isGroupActivity } from '../util';
import { logError } from '../util/logError';
import { taskNameFromType } from '../util/taskNameFromType';
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

export async function syncNewUserUsername(message: KlasaMessage) {
	if (!roll(20)) return;
	const cleanedUsername = cleanUsername(message.author.username);
	const username = cleanedUsername.length > 32 ? cleanedUsername.substring(0, 32) : cleanedUsername;
	await prisma.newUser.upsert({
		where: {
			id: message.author.id
		},
		update: {
			username
		},
		create: {
			id: message.author.id,
			username
		}
	});
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

export async function syncActivityCache() {
	const tasks = await prisma.activity.findMany({ where: { completed: false } });

	minionActivityCache.clear();
	for (const task of tasks) {
		activitySync(task);
	}
}

export async function runMahojiCommand({
	channelID,
	userID,
	guildID,
	commandName,
	options,
	user,
	member
}: {
	commandName: string;
	options: Record<string, unknown>;
	channelID: bigint | string;
	userID: bigint | string;
	guildID: bigint | string | undefined;
	user: MUser;
	member: APIInteractionGuildMember | GuildMember | null;
}) {
	const mahojiCommand = globalClient.mahojiClient.commands.values.find(c => c.name === commandName);
	if (!mahojiCommand) {
		throw new Error(`No mahoji command found for ${commandName}`);
	}

	return mahojiCommand.run({
		userID: BigInt(userID),
		guildID: guildID ? BigInt(guildID) : undefined,
		channelID: BigInt(channelID),
		options,
		// TODO: Make this typesafe
		user: user as any,
		member: member as any,
		client: globalClient.mahojiClient,
		interaction: null as any
	});
}

export interface RunCommandArgs {
	commandName: string;
	args: CommandArgs;
	user: MUser;
	channelID: string | bigint;
	userID: string | bigint;
	member: APIInteractionGuildMember | GuildMember | null;
	isContinue?: boolean;
	method?: string;
	bypassInhibitors?: true;
	guildID: string | bigint | undefined;
	msg?: KlasaMessage;
}
export async function runCommand({
	commandName,
	args,
	isContinue,
	method = 'run',
	bypassInhibitors,
	userID,
	channelID,
	guildID,
	user,
	member,
	msg
}: RunCommandArgs) {
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channel || !channelIsSendable(channel)) return;
	const mahojiCommand = globalClient.mahojiClient.commands.values.find(c => c.name === commandName);
	const command = globalClient.commands.get(commandName) as BotCommand | undefined;
	const actualCommand = mahojiCommand ?? command;
	if (!actualCommand) throw new Error('No command found');
	const abstractCommand =
		actualCommand instanceof BotCommand
			? convertKlasaCommandToAbstractCommand(actualCommand)
			: convertMahojiCommandToAbstractCommand(actualCommand);

	let error: Error | null = null;
	let inhibited = false;
	try {
		const inhibitedReason = await preCommand({
			abstractCommand,
			userID,
			channelID,
			guildID,
			bypassInhibitors: bypassInhibitors ?? false
		});

		if (inhibitedReason) {
			inhibited = true;
			if (inhibitedReason.silent) return;
			return channel.send(
				typeof inhibitedReason.reason === 'string' ? inhibitedReason.reason : inhibitedReason.reason.content!
			);
		}

		if (mahojiCommand) {
			if (Array.isArray(args)) throw new Error(`Had array of args for mahoji command called ${commandName}`);
			const result = await runMahojiCommand({
				options: args,
				commandName,
				guildID,
				channelID,
				userID,
				member,
				user
			});
			if (channelIsSendable(channel)) {
				if (typeof result === 'string') {
					await channel.send(result);
				} else {
					await channel.send({
						content: result.content,
						embeds: result.embeds?.map(convertAPIEmbedToDJSEmbed),
						components: result.components?.map(convertComponentDJSComponent),
						files: result.attachments?.map(i => new MessageAttachment(i.buffer, i.fileName))
					});
				}
			}
		} else {
			if (!Array.isArray(args)) throw new Error('Had object args for non-mahoji command');
			if (!command) throw new Error(`Tried to run \`${commandName}\` command, but couldn't find the piece.`);
			if (!command.enabled) throw new Error(`The ${command.name} command is disabled.`);
			const fakeMessage = msg ?? {
				author: user,
				member,
				channel
			};
			try {
				// @ts-ignore Cant be typechecked
				const result = await command[method](fakeMessage, args);
				return result;
			} catch (err) {
				logError(err, {
					user_id: userID.toString(),
					command_name: commandName,
					args: JSON.stringify(args)
				});
			}
		}
	} catch (err: any) {
		if (typeof err === 'string') {
			if (channelIsSendable(channel)) {
				return channel.send(err);
			}
		}
		error = err as Error;
	} finally {
		try {
			await postCommand({
				abstractCommand,
				userID,
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

export async function completeActivity(_activity: Activity) {
	const activity = convertStoredActivityToFlatActivity(_activity);
	if (_activity.completed) {
		throw new Error('Tried to complete an already completed task.');
	}

	const taskName = taskNameFromType(activity.type);
	const task = globalClient.tasks.get(taskName);

	if (!task) {
		throw new Error('Missing task');
	}

	globalClient.oneCommandAtATimeCache.add(activity.userID);
	try {
		globalClient.emit('debug', `Running ${task.name} for ${activity.userID}`);
		await task.run(activity);
	} catch (err) {
		logError(err);
	} finally {
		globalClient.oneCommandAtATimeCache.delete(activity.userID);
		minionActivityCacheDelete(activity.userID);
	}
}
