import { TimerManager } from '@sapphire/timer-manager';

import { modifyBusyCounter } from '@/lib/busyCounterCache.js';
import { busyImmuneCommands } from '@/lib/constants.js';
import type { CommandOptions } from '@/lib/discord/commandOptions.js';
import { makeCommandUsage } from '@/lib/util/commandUsage.js';

const COMMANDS_TO_NOT_TRACK = [['minion', ['k', 'kill', 'clue', 'info']]];
function shouldTrackCommand(command: OSBMahojiCommand, args: CommandOptions) {
	if (!Array.isArray(args)) return true;
	for (const [name, subs] of COMMANDS_TO_NOT_TRACK) {
		if (command.name === name && typeof args[0] === 'string' && subs.includes(args[0])) {
			return false;
		}
	}
	return true;
}

export async function postCommand({
	command,
	args,
	isContinue,
	inhibited,
	continueDeltaMillis,
	interaction
}: {
	interaction: MInteraction;
	command: OSBMahojiCommand;
	args: CommandOptions;
	isContinue: boolean;
	inhibited: boolean;
	continueDeltaMillis: number | null;
}): Promise<string | undefined> {
	const userID = interaction.user.id;
	if (!busyImmuneCommands.includes(command.name)) {
		TimerManager.setTimeout(() => modifyBusyCounter(userID, -1), 1000);
	}
	if (shouldTrackCommand(command, args)) {
		const commandUsage = makeCommandUsage({
			commandName: command.name,
			args,
			isContinue,
			inhibited,
			continueDeltaMillis,
			interaction,
			userID
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
						last_command_date: new Date(),
						username: globalClient.users.cache.get(userID)?.username
					},
					update: {
						last_command_date: new Date(),
						username: globalClient.users.cache.get(userID)?.username
					},
					select: {
						id: true
					}
				})
			]);
		} catch (err) {
			Logging.logError(err as Error);
		}
	}
	if (inhibited) return;

	return undefined;
}
