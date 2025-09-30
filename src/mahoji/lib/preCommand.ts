import type { CommandOptions } from '@oldschoolgg/toolkit';
import type { InteractionReplyOptions } from 'discord.js';

import { modifyBusyCounter } from '@/lib/busyCounterCache.js';
import { busyImmuneCommands } from '@/lib/constants.js';
import { runInhibitors } from '@/mahoji/lib/inhibitors.js';

interface PreCommandOptions {
	command: OSBMahojiCommand;
	user: MUser;
	bypassInhibitors: boolean;
	options: CommandOptions;
	interaction: MInteraction;
}

type PrecommandReturn = Promise<
	| undefined
	| {
			reason: InteractionReplyOptions;
			dontRunPostCommand?: boolean;
			silent?: boolean;
	  }
>;

export async function preCommand({
	command,
	interaction,
	bypassInhibitors,
	user
}: PreCommandOptions): PrecommandReturn {
	if (globalClient.isShuttingDown) {
		return {
			reason: { content: 'The bot is currently restarting, please try again later.' },
			dontRunPostCommand: true
		};
	}

	if (user.isBusy && !bypassInhibitors && !busyImmuneCommands.includes(command.name)) {
		return { reason: { content: 'You cannot use a command right now.' }, dontRunPostCommand: true };
	}
	if (!busyImmuneCommands.includes(command.name)) modifyBusyCounter(user.id, 1);

	const inhibitResult = runInhibitors({
		user,
		guild: interaction.guild ?? null,
		member: interaction.member ?? null,
		command,
		channel: interaction.channel ?? null,
		bypassInhibitors
	});

	if (inhibitResult !== undefined) {
		return inhibitResult;
	}
}
