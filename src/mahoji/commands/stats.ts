import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

import { statsEmbed } from '../../lib/util/statsEmbed';
import { toTitleCase } from '../../lib/util/toTitleCase';
import { OSBMahojiCommand } from '../lib/util';

const accountTypeOptions = Object.values(AccountType).map(val => {
	let name: string = val;
	if (name === 'seasonal') name = 'Leagues (Seasonal)';
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
	run: async ({ options }: CommandRunOptions<{ username: string; type?: AccountType; virtual?: boolean }>) => {
		try {
			if (!options.type) {
				options.type = AccountType.Normal;
			}
			const player = await Hiscores.fetch(options.username, {
				type: options.type,
				virtualLevels: Boolean(options.virtual)
			});
			const postfix = options.type === AccountType.Seasonal ? 'Shattered Relics Leagues' : options.type ?? null;
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
