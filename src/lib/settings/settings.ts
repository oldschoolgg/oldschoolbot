import { NewUser } from '@prisma/client';
import { Util } from 'discord.js';
import { roll } from 'e';
import { Gateway, KlasaMessage, KlasaUser, Settings } from 'klasa';
import { Bank } from 'oldschooljs';

import { client, mahojiClient } from '../..';
import { CommandArgs } from '../../mahoji/lib/inhibitors';
import { postCommand } from '../../mahoji/lib/postCommand';
import { preCommand } from '../../mahoji/lib/preCommand';
import {
	convertAPIEmbedToDJSEmbed,
	convertComponentDJSComponent,
	convertKlasaCommandToAbstractCommand,
	convertMahojiCommandToAbstractCommand
} from '../../mahoji/lib/util';
import { Emoji } from '../constants';
import { BotCommand } from '../structures/BotCommand';
import { ActivityTaskData } from '../types/minions';
import { channelIsSendable, cleanUsername, isGroupActivity } from '../util';
import { logError } from '../util/logError';
import { activitySync, prisma } from './prisma';

export * from './minigames';

export async function getUserSettings(userID: string): Promise<Settings> {
	return (client.gateways.get('users') as Gateway)!
		.acquire({
			id: userID
		})
		.sync(true);
}

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

export async function getMinionName(userID: string): Promise<string> {
	const result = await client.query<{ name?: string; isIronman: boolean; icon?: string }[]>(
		'SELECT "minion.name" as name, "minion.ironman" as isIronman, "minion.icon" as icon FROM users WHERE id = $1;',
		[userID]
	);
	if (result.length === 0) {
		throw new Error('No user found in database for minion name.');
	}

	const [{ name, isIronman, icon }] = result;

	const prefix = isIronman ? Emoji.Ironman : '';

	const displayIcon = icon ?? Emoji.Minion;

	return name ? `${prefix} ${displayIcon} **${Util.escapeMarkdown(name)}**` : `${prefix} ${displayIcon} Your minion`;
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
	msg,
	commandName,
	options
}: {
	msg: KlasaMessage;
	commandName: string;
	options: Record<string, unknown>;
}) {
	const mahojiCommand = mahojiClient.commands.values.find(c => c.name === commandName);
	if (!mahojiCommand) {
		throw new Error(`No mahoji command found for ${commandName}`);
	}

	return mahojiCommand.run({
		userID: BigInt(msg.author.id),
		guildID: msg.guild ? BigInt(msg.guild.id) : (null as any),
		channelID: BigInt(msg.channel.id),
		options,
		user: msg.author as any, // kinda dirty
		member: msg.member as any,
		client: mahojiClient,
		interaction: null as any
	});
}

export async function runCommand({
	message,
	commandName,
	args,
	isContinue,
	method = 'run',
	bypassInhibitors
}: {
	message: KlasaMessage;
	commandName: string;
	args: CommandArgs;
	isContinue?: boolean;
	method?: string;
	bypassInhibitors?: true;
}) {
	const channel = client.channels.cache.get(message.channel.id);

	const mahojiCommand = mahojiClient.commands.values.find(c => c.name === commandName);
	const command = message.client.commands.get(commandName) as BotCommand | undefined;
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
			userID: message.author.id,
			channelID: message.channel.id,
			guildID: message.guild?.id ?? null,
			bypassInhibitors: bypassInhibitors ?? false
		});

		if (inhibitedReason) {
			inhibited = true;
			if (inhibitedReason.silent) return;
			return message.channel.send(inhibitedReason.reason);
		}

		if (mahojiCommand) {
			if (Array.isArray(args)) throw new Error(`Had array of args for mahoji command called ${commandName}`);
			const result = await runMahojiCommand({
				msg: message,
				options: args,
				commandName
			});
			if (channelIsSendable(channel)) {
				if (typeof result === 'string') {
					await channel.send(result);
				} else {
					await channel.send({
						...result,
						embeds: result.embeds?.map(convertAPIEmbedToDJSEmbed),
						components: result.components?.map(convertComponentDJSComponent)
					});
				}
			}
		} else {
			if (!Array.isArray(args)) throw new Error('Had object args for non-mahoji command');
			if (!command) throw new Error(`Tried to run \`${commandName}\` command, but couldn't find the piece.`);
			if (!command.enabled) throw new Error(`The ${command.name} command is disabled.`);

			try {
				// @ts-ignore Cant be typechecked
				const result = await command[method](message, args);
				return result;
			} catch (err) {
				message.client.emit('commandError', message, command, args, err);
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
				userID: message.author.id,
				guildID: message.guild?.id ?? null,
				channelID: message.channel.id,
				args,
				error,
				msg: message,
				isContinue: isContinue ?? false,
				inhibited
			});
		} catch (err) {
			logError(err);
		}
	}

	return null;
}

export async function getBuyLimitBank(user: KlasaUser) {
	const boughtBank = await prisma.user.findFirst({
		where: {
			id: user.id
		},
		select: {
			weekly_buy_bank: true
		}
	});
	if (!boughtBank) {
		throw new Error(`Found no weekly_buy_bank for ${user.sanitizedName}`);
	}
	return new Bank(boughtBank.weekly_buy_bank as any);
}

export async function addToBuyLimitBank(user: KlasaUser, newBank: Bank) {
	const current = await getBuyLimitBank(user);
	const result = await prisma.user.update({
		where: {
			id: user.id
		},
		data: {
			weekly_buy_bank: current.add(newBank).bank
		}
	});
	if (!result) {
		throw new Error('Error storing updated weekly_buy_bank');
	}
	return true;
}
