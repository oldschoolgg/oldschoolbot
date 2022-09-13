import { shouldTrackCommand, SILENT_ERROR } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { channelIsSendable, cleanMentions } from '../../lib/util';
import { makeCommandUsage } from '../../lib/util/commandUsage';
import { logError } from '../../lib/util/logError';
import { AbstractCommand, CommandArgs } from './inhibitors';

export async function handleCommandError({
	args,
	commandName,
	error,
	userID,
	channelID
}: {
	args: CommandArgs;
	commandName: string;
	error: string | Error;
	userID: string | bigint;
	channelID: bigint | string;
}): Promise<void> {
	const channel = globalClient.channels.cache.get(channelID.toString());
	if (!channelIsSendable(channel)) return;
	if (error instanceof Error && error.message === SILENT_ERROR) {
		return;
	}
	if (typeof error === 'string') {
		console.log(`string error used ${error}`);
		await channel.send(cleanMentions(null, error));
		return;
	}

	if (error.name === 'AbortError') {
		return;
	}

	logError(error, {
		user_id: userID.toString(),
		command: commandName,
		args: Array.isArray(args)
			? args.join(', ')
			: Object.entries(args)
					.map(arg => `${arg[0]}[${arg[1]}]`)
					.join(', ')
	});
}

export async function postCommand({
	abstractCommand,
	userID,
	guildID,
	channelID,
	args,
	error,
	isContinue,
	inhibited
}: {
	abstractCommand: AbstractCommand;
	userID: string | bigint;
	guildID?: string | bigint | null;
	channelID: string | bigint;
	error: Error | string | null;
	args: CommandArgs;
	isContinue: boolean;
	inhibited: boolean;
}): Promise<string | undefined> {
	if (!inhibited && shouldTrackCommand(abstractCommand, args)) {
		const commandUsage = makeCommandUsage({
			userID,
			channelID,
			guildID,
			commandName: abstractCommand.name,
			args,
			isContinue,
			flags: null,
			inhibited
		});
		await prisma.commandUsage.create({
			data: commandUsage
		});
	}

	if (error) {
		handleCommandError({ error, userID, args, commandName: abstractCommand.name, channelID });
	}

	setTimeout(() => globalClient.oneCommandAtATimeCache.delete(userID.toString()), 1000);

	return undefined;
}
