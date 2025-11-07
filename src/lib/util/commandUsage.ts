import { isObject } from '@oldschoolgg/toolkit';

import type { CommandOptions, MahojiUserOption } from '@/lib/discord/index.js';

function isMahojiUserOption(data: MahojiUserOption | CommandOptions): data is MahojiUserOption {
	// @ts-expect-error
	return 'user' in data && data.user && 'id' in data.user;
}

export interface CompressedArg {
	[key: string]: string | number | boolean | null | undefined | CompressedArg;
}

export function compressMahojiArgs(options: CommandOptions) {
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
			newOptions[key] = compressMahojiArgs(val);
			continue;
		}

		newOptions[key] = null;
	}
	return newOptions;
}
