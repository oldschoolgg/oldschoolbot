import { Interaction } from 'discord.js';
import { convertAPIOptionsToCommandOptions } from 'mahoji/dist/lib/util';

export function logError(err: Error | unknown, context?: Record<string, string>, extra?: Record<string, string>) {
	console.error(context, err, extra);
}

export function logErrorForInteraction(err: Error | unknown, interaction: Interaction) {
	const context: Record<string, any> = {
		user_id: interaction.user.id,
		channel_id: interaction.channelId,
		guild_id: interaction.guildId,
		interaction_id: interaction.id,
		interaction_type: interaction.type
	};
	if (interaction.isChatInputCommand()) {
		context.options = convertAPIOptionsToCommandOptions(interaction.options.data, interaction.options.resolved);
		context.command_name = interaction.commandName;
	}

	logError(err, context);
}
