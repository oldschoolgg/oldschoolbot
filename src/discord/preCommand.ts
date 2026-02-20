import type { command_name_enum } from '@/prisma/main/enums.js';
import { getInteractionOptionsForLog } from '@/discord/index.js';
import { runInhibitors } from '@/discord/inhibitors.js';

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

export async function preCommand({ command, interaction, user, options }: PreCommandOptions): PrecommandReturn {
	Logging.logDebug(`${user.logName} ran command: ${command.name}`);
	const commandName: command_name_enum = command.name as command_name_enum;
	if (!interaction.channelId) {
		throw new Error(`${interaction}\n${JSON.stringify(interaction)}`.slice(0, 1000));
	}
	prisma.commandUsage
		.create({
			data: {
				user_id: BigInt(user.id),
				channel_id: BigInt(interaction.channelId),
				guild_id: interaction.guildId ? BigInt(interaction.guildId) : undefined,
				command_name: commandName,
				args: getInteractionOptionsForLog({ command: commandName, interaction }),
				inhibited: false,
				is_mention_command: false
			}
		})
		.catch(err => Logging.logError({ err, interaction }));

	const start = performance.now();
	const inhibitResult = runInhibitors({
		user,
		command,
		interaction,
		options
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
