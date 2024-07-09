import { convertAPIOptionsToCommandOptions } from '@oldschoolgg/toolkit';
import { captureException } from '@sentry/node';
import type { Interaction } from 'discord.js';

import { production } from '../../config';
import getOSItem from './getOSItem';

export function assert(condition: boolean, desc?: string, context?: Record<string, string>) {
	if (!condition) {
		if (production) {
			logError(new Error(desc ?? 'Failed assertion'), context);
		} else {
			throw new Error(desc ?? 'Failed assertion');
		}
	}
}
assert(getOSItem('Smokey').id === 737);

export function logError(err: Error | unknown, context?: Record<string, string>, extra?: Record<string, string>) {
	console.error(context, err);
	if (production) {
		captureException(err, {
			tags: context,
			extra
		});
	} else {
		console.error(err);
		console.log(context);
		console.log(extra);
	}
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
		context.options = JSON.stringify(
			convertAPIOptionsToCommandOptions(interaction.options.data, interaction.options.resolved)
		);
		context.command_name = interaction.commandName;
	} else if (interaction.isButton()) {
		context.button_id = interaction.customId;
	}

	logError(err, context);
}
