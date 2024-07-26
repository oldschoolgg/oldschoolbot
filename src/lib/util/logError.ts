import { convertAPIOptionsToCommandOptions } from '@oldschoolgg/toolkit';
import type { Interaction } from 'discord.js';

import { isObject } from 'e';

export function assert(condition: boolean, desc?: string, context?: Record<string, string>) {
	if (!condition) {
		logError(new Error(desc ?? 'Failed assertion'), context);
	}
}

export function logError(err: Error | unknown, context?: Record<string, string>, extra?: Record<string, string>) {
	console.error(err, context, extra);
}

export function logErrorForInteraction(
	err: Error | unknown,
	interaction: Interaction,
	extraContext?: Record<string, string>
) {
	const context: Record<string, any> = {
		user_id: interaction.user.id,
		channel_id: interaction.channelId,
		guild_id: interaction.guildId,
		interaction_id: interaction.id,
		interaction_type: interaction.type,
		...extraContext,
		interaction_created_at: interaction.createdTimestamp,
		current_timestamp: Date.now(),
		difference_ms: Date.now() - interaction.createdTimestamp,
		was_deferred: interaction.isRepliable() ? interaction.deferred : 'N/A'
	};
	if (interaction.isChatInputCommand()) {
		context.options = JSON.stringify(
			convertAPIOptionsToCommandOptions(interaction.options.data, interaction.options.resolved)
		);
		context.command_name = interaction.commandName;
	} else if (interaction.isButton()) {
		context.button_id = interaction.customId;
	}

	if ('rawError' in interaction) {
		const _err = err as any;
		if ('requestBody' in _err && isObject(_err.requestBody)) {
			context.request_body = JSON.stringify(_err.requestBody);
		}
	}

	logError(err, context);
}
