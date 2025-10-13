import type { command_name_enum } from '@prisma/client';
import type { InteractionReplyOptions } from 'discord.js';

import type { CommandOptions } from '@/lib/discord/commandOptions.js';
import { runInhibitors } from '@/lib/discord/inhibitors.js';

interface PreCommandOptions {
	command: OSBMahojiCommand;
	user: MUser;
	options: CommandOptions;
	interaction: MInteraction;
}

export type InhibitorResult = {
	reason: InteractionReplyOptions;
	runPostCommand: boolean;
	silent?: boolean;
};

type PrecommandReturn = Promise<undefined | InhibitorResult>;

export async function preCommand({ command, interaction, user }: PreCommandOptions): PrecommandReturn {
	Logging.logDebug(`${user.logName} ran command: ${command.name}`, {
		...interaction.getDebugInfo()
	});
	const commandUsage = await prisma.commandUsage.create({
		data: {
			user_id: BigInt(user.id),
			channel_id: BigInt(interaction.channelId),
			guild_id: interaction.guildId ? BigInt(interaction.guildId) : undefined,
			command_name: command.name as command_name_enum,
			args: interaction.getChatInputCommandOptions(),
			inhibited: false,
			is_mention_command: false
		}
	});

	const inhibitResult = runInhibitors({
		user,
		guild: interaction.guild ?? null,
		member: interaction.member ?? null,
		command,
		channel: interaction.channel ?? null
	});

	if (inhibitResult !== undefined) {
		await prisma.commandUsage.update({
			where: {
				id: commandUsage.id
			},
			data: {
				inhibited: true
			}
		});
		return inhibitResult;
	}
}
