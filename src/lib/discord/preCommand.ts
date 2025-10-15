import type { command_name_enum } from '@prisma/client';
import type { InteractionReplyOptions } from 'discord.js';

import type { AnyCommand, CommandOptions } from '@/lib/discord/commandOptions.js';
import { runInhibitors } from '@/lib/discord/inhibitors.js';

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
	prisma.commandUsage
		.create({
			data: {
				user_id: BigInt(user.id),
				channel_id: BigInt(interaction.channelId),
				guild_id: interaction.guildId ? BigInt(interaction.guildId) : undefined,
				command_name: command.name as command_name_enum,
				args: interaction.getChatInputCommandOptions(),
				inhibited: false,
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
