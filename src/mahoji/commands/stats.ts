import { toTitleCase } from '@oldschoolgg/toolkit';
import { ACCOUNT_TYPES, type AccountType, Hiscores } from 'oldschooljs/hiscores';

import { statsEmbed } from '@/lib/util/statsEmbed.js';

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
			type: 'String',
			name: 'username',
			description: 'The RuneScape username of the account.',
			required: true
		},
		{
			type: 'String',
			name: 'type',
			description: 'The type of account (normal, ironman, HCIM, DMM, leagues, etc).',
			choices: accountTypeOptions,
			required: false
		},
		{
			type: 'Boolean',
			name: 'virtual',
			description: 'Show virtual stats? (Up to level 120)',
			required: false
		}
	],
	run: async ({ options }: CommandRunOptions<{ username: string; type?: AccountType; virtual?: boolean }>) => {
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
