import type { CommandOptions } from '@oldschoolgg/toolkit/util';

import { modifyBusyCounter } from '../../lib/busyCounterCache';
import { busyImmuneCommands, shouldTrackCommand } from '../../lib/constants';

import { TimerManager } from '@sapphire/timer-manager';
import { makeCommandUsage } from '../../lib/util/commandUsage';
import { logError } from '../../lib/util/logError';
import type { AbstractCommand } from './inhibitors';

export async function postCommand({
	abstractCommand,
	userID,
	guildID,
	channelID,
	args,
	isContinue,
	inhibited,
	continueDeltaMillis
}: {
	abstractCommand: AbstractCommand;
	userID: string;
	guildID?: string | bigint | null;
	channelID: string | bigint;
	error: Error | string | null;
	args: CommandOptions;
	isContinue: boolean;
	inhibited: boolean;
	continueDeltaMillis: number | null;
}): Promise<string | undefined> {
	if (!busyImmuneCommands.includes(abstractCommand.name)) {
		TimerManager.setTimeout(() => modifyBusyCounter(userID, -1), 1000);
	}
	if (shouldTrackCommand(abstractCommand, args)) {
		const commandUsage = makeCommandUsage({
			userID,
			channelID,
			guildID,
			commandName: abstractCommand.name,
			args,
			isContinue,
			inhibited,
			continueDeltaMillis
		});
		try {
			await prisma.$transaction([
				prisma.commandUsage.create({
					data: commandUsage,
					select: {
						id: true
					}
				}),
				prisma.user.upsert({
					where: {
						id: userID
					},
					create: {
						id: userID,
						last_command_date: new Date()
					},
					update: {
						last_command_date: new Date()
					},
					select: {
						id: true
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
