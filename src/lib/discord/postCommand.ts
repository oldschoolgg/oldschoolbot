import { TimerManager } from '@sapphire/timer-manager';

import { modifyBusyCounter } from '@/lib/busyCounterCache.js';
import { busyImmuneCommands } from '@/lib/constants.js';
import type { CommandOptions } from '@/lib/discord/commandOptions.js';

export async function postCommand({
	command,
	interaction
}: {
	interaction: MInteraction;
	command: OSBMahojiCommand;
	args: CommandOptions;
	isContinue: boolean;
	inhibited: boolean;
	continueDeltaMillis: number | null;
}): Promise<void> {
	const userID = interaction.user.id;
	if (!busyImmuneCommands.includes(command.name)) {
		TimerManager.setTimeout(() => modifyBusyCounter(userID, -1), 1000);
	}
}
