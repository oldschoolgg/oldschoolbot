import { convertAPIOptionsToCommandOptions } from '@oldschoolgg/toolkit/discord-util';
import { deepMerge } from '@oldschoolgg/toolkit/util';
import { captureException } from '@sentry/node';
import type { Interaction } from 'discord.js';
import { isObject } from 'e';

import { globalConfig } from '../constants';

export function assert(condition: boolean, desc?: string, context?: Record<string, string>) {
	if (!condition) {
		if (globalConfig.isProduction) {
			logError(new Error(desc ?? 'Failed assertion'), context);
		} else {
			throw new Error(desc ?? 'Failed assertion');
		}
	}
}

export function logError(err: any, context?: Record<string, string>, extra?: Record<string, string>) {
	const metaInfo = deepMerge(context ?? {}, extra ?? {});
	if (err?.requestBody?.files) {
		err.requestBody = [];
	}
	if (err?.requestBody?.json) {
		err.requestBody.json = String(err.requestBody.json).slice(0, 500);
	}
	console.error(
		JSON.stringify({
			type: 'ERROR',
			error: err.stack ?? err.message,
			info: metaInfo
		})
	);

	if (globalConfig.isProduction) {
		captureException(err, {
			tags: context,
			extra: metaInfo
		});
	}

	if (process.env.TEST) {
		throw err;
	}
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
