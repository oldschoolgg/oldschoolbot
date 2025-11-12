import type { InteractionReplyOptions } from 'discord.js';

import type { command_name_enum } from '@/prisma/main/enums.js';
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
	const debugInfo = typeof interaction.getDebugInfo === 'function' ? interaction.getDebugInfo() : undefined;
	Logging.logDebug(`${user.logName} ran command: ${command.name}`, debugInfo ?? {});
	const commandName: command_name_enum = command.name as command_name_enum;
	const args =
		typeof interaction.getChatInputCommandOptions === 'function'
			? interaction.getChatInputCommandOptions(commandName)
			: undefined;
	const shouldPersistUsage =
		typeof interaction.channelId === 'string' && typeof user.id === 'string' && user.id.length > 0;
	if (shouldPersistUsage) {
		prisma.commandUsage
			.create({
				data: {
					user_id: BigInt(user.id),
					channel_id: BigInt(interaction.channelId),
					guild_id: typeof interaction.guildId === 'string' ? BigInt(interaction.guildId) : undefined,
					command_name: commandName,
					args,
					inhibited: false,
					is_mention_command: false
				}
			})
			.catch(err => Logging.logError({ err, interaction: debugInfo ? interaction : undefined }));
	}

	const start = performance.now();
        const inhibitResult = await runInhibitors({
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
		interaction: debugInfo ? interaction : undefined
	});

	if (inhibitResult !== undefined) {
		return inhibitResult;
	}
}
