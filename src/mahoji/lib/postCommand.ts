import { captureException } from '@sentry/node';
import { MessageEmbed, User } from 'discord.js';
import { KlasaMessage } from 'klasa';

import { client } from '../..';
import { production } from '../../config';
import { Emoji, shouldTrackCommand, SILENT_ERROR } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { cleanMentions } from '../../lib/util';
import { makeCommandUsage } from '../../lib/util/commandUsage';
import { AbstractCommand, CommandArgs } from './inhibitors';

export async function handleCommandError({
	args,
	commandName,
	error,
	userID,
	msg
}: {
	args: CommandArgs;
	commandName: string;
	error: string | Error;
	userID: string;
	msg: KlasaMessage | null;
}): Promise<void> {
	if (error instanceof Error && error.message === SILENT_ERROR) {
		return;
	}
	if (typeof error === 'string') {
		console.log(`string error used ${error}`);
		await msg?.channel.send(cleanMentions(null, error));
		return;
	}

	if (error.name === 'AbortError') {
		await msg?.channel.send('Oops! I had a network issue trying to respond to your command. Please try again.');
		return;
	}

	captureException(error, {
		user: {
			id: userID
		},
		tags: {
			command: commandName,
			args: Array.isArray(args)
				? args.join(', ')
				: Object.entries(args)
						.map(arg => `${arg[0]}[${arg[1]}]`)
						.join(', ')
		}
	});

	if (!production) {
		console.error(error);
		const channel = await (client.owners.values().next().value as User).createDM();

		channel.send({
			embeds: [
				new MessageEmbed()
					.setDescription(
						`${error.message}
            
${error.stack}`
					)
					.setColor(0xfc_10_20)
					.setTimestamp()
			]
		});
	}

	await msg?.channel.send(`An unexpected error occurred ${Emoji.Sad}`);
}

export async function postCommand({
	abstractCommand,
	userID,
	guildID,
	channelID,
	args,
	error,
	msg,
	isContinue
}: {
	abstractCommand: AbstractCommand;
	userID: string;
	guildID: string | null;
	channelID: string;
	error: Error | string | null;
	args: CommandArgs;
	msg: KlasaMessage | null;
	isContinue: boolean;
}): Promise<string | undefined> {
	if (shouldTrackCommand(abstractCommand, args)) {
		const commandUsage = makeCommandUsage({
			userID,
			channelID,
			guildID,
			commandName: abstractCommand.name,
			args,
			isContinue,
			flags: null
		});
		await prisma.commandUsage.create({
			data: commandUsage
		});
	}

	if (error) {
		handleCommandError({ error, userID, args, commandName: abstractCommand.name, msg });
	}

	if (abstractCommand.attributes?.oneAtTime) {
		setTimeout(() => client.oneCommandAtATimeCache.delete(userID), 1500);
	}

	return undefined;
}
