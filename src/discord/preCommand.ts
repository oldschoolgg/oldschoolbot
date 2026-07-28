import type { command_name_enum } from '@/prisma/main/enums.js';
import { getInteractionOptionsForLog } from '@/discord/index.js';
import { runInhibitors } from '@/discord/inhibitors.js';

interface PreCommandOptions {
	command: AnyCommand;
	user: MUser;
	options: CommandOptions;
	interaction: MInteraction;
	isContinue?: boolean;
	continueDeltaMs?: number | null;
}

export type InhibitorResult = {
	reason: BaseSendableMessage;
	silent?: boolean;
};

type PrecommandReturn = Promise<undefined | InhibitorResult>;

export async function preCommand({
	command,
	interaction,
	user,
	options,
	isContinue,
	continueDeltaMs
}: PreCommandOptions): PrecommandReturn {
	Logging.logDebug(`${user.logName} ran command: ${command.name}`);
	const commandName: command_name_enum = command.name as command_name_enum;
	const logArgs = getInteractionOptionsForLog({ command: commandName, interaction, options });
	const logContext = {
		commandName,
		userName: user.logName,
		userId: user.id,
		guildId: interaction.guildId,
		channelId: interaction.channelId,
		args: logArgs
	};

	if (!interaction.channelId) {
		throw new Error(`${interaction}\n${JSON.stringify(interaction)}`.slice(0, 1000));
	}
	// Todo: get the promise, and pass it thru to the commandFinish to get inihibited, duration, result, etc
	prisma.commandUsage
		.create({
			data: {
				user_id: BigInt(user.id),
				channel_id: BigInt(interaction.channelId),
				guild_id: interaction.guildId ? BigInt(interaction.guildId) : undefined,
				command_name: commandName,
				args: logArgs,
				inhibited: false,
				is_mention_command: false,
				is_continue: isContinue ?? false,
				continue_delta_millis: continueDeltaMs ?? null
			}
		})
		.catch(err => Logging.logError({ err, interaction, context: logContext }));

	if (user.isAdmin()) return;

	const start = performance.now();
	const inhibitResult = await runInhibitors({
		user,
		command,
		interaction
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
