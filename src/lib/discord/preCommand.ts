import { roll } from '@oldschoolgg/rng';
import type { InteractionReplyOptions } from 'discord.js';

import { modifyBusyCounter } from '@/lib/busyCounterCache.js';
import { busyImmuneCommands } from '@/lib/constants.js';
import type { CommandOptions } from '@/lib/discord/commandOptions.js';
import { runInhibitors } from '@/lib/discord/inhibitors.js';
import { gearValidationChecks } from '@/mahoji/commands/gear.js';

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

	if (!gearValidationChecks.has(user.id) && roll(3)) {
		const { itemsUnequippedAndRefunded } = await user.validateEquippedGear();
		if (itemsUnequippedAndRefunded.length > 0) {
			return {
				reason: {
					content: `You had some items equipped that you didn't have the requirements to use, so they were unequipped and refunded to your bank: ${itemsUnequippedAndRefunded}`
				}
			};
		}
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
