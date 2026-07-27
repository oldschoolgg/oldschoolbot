import { InteractionType } from '@oldschoolgg/discord';
import { isObject } from '@oldschoolgg/toolkit';

import { convertAPIOptionsToCommandOptions } from '@/discord/index.js';

function isMahojiUserOption(data: MahojiUserOption | CommandOptions): data is MahojiUserOption {
	// @ts-expect-error
	return 'user' in data && data.user && 'id' in data.user;
}

interface CompressedArg {
	[key: string]: string | number | boolean | null | undefined | CompressedArg;
}

function compressOptions(options: CommandOptions) {
	const newOptions: CompressedArg = {};
	for (const [key, val] of Object.entries(options) as [
		keyof CommandOptions,
		CommandOptions[keyof CommandOptions]
	][]) {
		if (val === null) continue;
		if (
			typeof val === 'string' ||
			typeof val === 'number' ||
			typeof val === 'boolean' ||
			typeof val === 'undefined'
		) {
			newOptions[key] = val;
			continue;
		}

		if ('id' in val) {
			newOptions[key] = (val as { id: string }).id;
			continue;
		}

		if (isMahojiUserOption(val)) {
			newOptions[key] = (val as MahojiUserOption).user.id;
			continue;
		}

		if (isObject(val)) {
			newOptions[key] = compressOptions(val);
			continue;
		}

		newOptions[key] = null;
	}
	return newOptions;
}

export function getInteractionOptionsForLog({ command, interaction }: { command: string; interaction: MInteraction }) {
	if (['bank', 'bs'].includes(command)) {
		return undefined;
	}
	if (interaction.rawInteraction.type !== InteractionType.ApplicationCommand) {
		return undefined;
	}
	const options = convertAPIOptionsToCommandOptions({
		guildId: interaction.rawInteraction.guild_id,
		options: interaction.rawInteraction.data.options ?? [],
		resolvedObjects: interaction.rawInteraction.data.resolved
	});
	const compressed = compressOptions(options);
	return compressed;
}
