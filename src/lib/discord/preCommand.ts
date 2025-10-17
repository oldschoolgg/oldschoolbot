import type { InteractionReplyOptions } from 'discord.js';

import type { AnyCommand, CommandOptions } from '@/lib/discord/commandOptions.js';
import { convertAPIOptionsToCommandOptions } from '@/lib/discord/index.js';
import { runInhibitors } from '@/lib/discord/inhibitors.js';
import { makeCommandUsage } from '@/lib/util/commandUsage.js';

interface PreCommandOptions {
	command: AnyCommand;
	user: MUser;
	options: CommandOptions;
	interaction: MInteraction;
}

export type InhibitorResult = {
	reason: InteractionReplyOptions;
	silent?: boolean;
};

type PrecommandReturn = Promise<undefined | InhibitorResult>;

export async function preCommand({ command, interaction, user }: PreCommandOptions): PrecommandReturn {
	Logging.logDebug(`${user.logName} ran command: ${command.name}`, {
		...interaction.getDebugInfo()
	});
	const args: CommandOptions = interaction.interaction.isChatInputCommand()
		? convertAPIOptionsToCommandOptions(
				interaction.interaction.options.data,
				interaction.interaction.options.resolved
			)
		: {};
	prisma.commandUsage
		.create({
			data: {
				...makeCommandUsage({
					commandName: command.name,
					args,
					isContinue: null,
					inhibited: false,
					continueDeltaMillis: null,
					userID: user.id,
					interaction
				}),
				is_mention_command: false
			}
		})
		.catch(err => Logging.logError({ err, interaction }));

	const start = performance.now();
	const inhibitResult = runInhibitors({
		user,
		guild: interaction.guild ?? null,
		member: interaction.member ?? null,
		command,
		channel: interaction.channel ?? null
	});
	const end = performance.now();
	Logging.logPerf({
		duration: end - start,
		text: 'Inhibitors',
		interaction
	});

	if (inhibitResult !== undefined) {
		return inhibitResult;
	}
}
