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
	reason: BaseSendableMessage;
	silent?: boolean;
};

type PrecommandReturn = Promise<undefined | InhibitorResult>;

export async function preCommand({ command, interaction, user }: PreCommandOptions): PrecommandReturn {
	Logging.logDebug(`${user.logName} ran command: ${command.name}`, {
		// TODO:
		// ...interaction.getDebugInfo()
	});
	const commandName: command_name_enum = command.name as command_name_enum;
	prisma.commandUsage
		.create({
			data: {
				user_id: BigInt(user.id),
				channel_id: BigInt(interaction.channelId),
				guild_id: interaction.guildId ? BigInt(interaction.guildId) : undefined,
				command_name: commandName,
				// TODO
				// args: interaction.getChatInputCommandOptions(commandName),
				inhibited: false,
				is_mention_command: false
			}
		})
		.catch(err => Logging.logError({ err, interaction }));

	const start = performance.now();
	const inhibitResult = runInhibitors({
		user,
		member: interaction.member ?? null,
		command,
		channelId: interaction.channelId,
		guildId: interaction.guildId
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
