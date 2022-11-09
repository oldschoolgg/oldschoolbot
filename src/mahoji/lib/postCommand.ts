import { modifyBusyCounter } from '../../lib/busyCounterCache';
import { shouldTrackCommand } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { makeCommandUsage } from '../../lib/util/commandUsage';
import { logError } from '../../lib/util/logError';
import { AbstractCommand, CommandArgs } from './inhibitors';

export async function postCommand({
	abstractCommand,
	userID,
	guildID,
	channelID,
	args,
	isContinue,
	inhibited
}: {
	abstractCommand: AbstractCommand;
	userID: string;
	guildID?: string | bigint | null;
	channelID: string | bigint;
	error: Error | string | null;
	args: CommandArgs;
	isContinue: boolean;
	inhibited: boolean;
}): Promise<string | undefined> {
	setTimeout(() => modifyBusyCounter(userID, -1), 1000);

	if (shouldTrackCommand(abstractCommand, args)) {
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
		try {
			await prisma.$transaction([
				prisma.commandUsage.create({
					data: commandUsage
				}),
				prisma.user.update({
					where: {
						id: userID
					},
					data: {
						last_command_date: new Date()
					}
				})
			]);
		} catch (err) {
			logError(err);
		}
	}
	if (inhibited) return;

	return undefined;
}
