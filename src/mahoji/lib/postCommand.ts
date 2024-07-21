import type { CommandOptions } from '@oldschoolgg/toolkit';

import { modifyBusyCounter } from '../../lib/busyCounterCache';
import { busyImmuneCommands } from '../../lib/constants';

import type { AbstractCommand } from './inhibitors';

export async function postCommand({
	abstractCommand,
	userID,
	inhibited
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
		setTimeout(() => modifyBusyCounter(userID, -1), 1000);
	}
	await prisma.user.update({
		where: {
			id: userID
		},
		data: {
			last_command_date: new Date()
		}
	});
	if (inhibited) return;

	return undefined;
}
