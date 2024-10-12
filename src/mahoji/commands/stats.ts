import { toTitleCase } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Hiscores } from 'oldschooljs';
import type { hiscoreURLs } from 'oldschooljs/dist/constants';
import { ACCOUNT_TYPES } from 'oldschooljs/dist/constants';

import { statsEmbed } from '../../lib/util/statsEmbed';
import type { OSBMahojiCommand } from '../lib/util';

const accountTypeOptions = ACCOUNT_TYPES.map(val => {
	let name: string = val;
	if (name === 'seasonal') name = 'Leagues (Seasonal)';
	if (name === 'skiller') name = 'Skiller';
	if (name === 'skiller_defence') name = '1-defence pure';
	return {
		name: toTitleCase(name),
		value: val
	};
});

export const statsCommand: OSBMahojiCommand = {
	name: 'stats',
	description: 'Check the stats of a OSRS account.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'username',
			description: 'The RuneScape username of the account.',
			required: true
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'type',
			description: 'The type of account (normal, ironman, HCIM, DMM, leagues, etc).',
			choices: accountTypeOptions,
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'virtual',
			description: 'Show virtual stats? (Up to level 120)',
			required: false
		}
	],
	run: async ({
		options
	}: CommandRunOptions<{ username: string; type?: keyof typeof hiscoreURLs; virtual?: boolean }>) => {
		try {
			if (!options.type) {
				options.type = 'normal';
			}
			const player = await Hiscores.fetch(options.username, {
				type: options.type,
				virtualLevels: Boolean(options.virtual)
			});
			const postfix = options.type === 'seasonal' ? 'Shattered Relics Leagues' : (options.type ?? null);
			return {
				embeds: [
					statsEmbed({
						username: options.username,
						color: 7_981_338,
						player,
						postfix: postfix ? ` (${postfix})` : undefined,
						key: 'level'
					})
				]
			};
		} catch (err: any) {
			return err.message;
		}
	}
};
