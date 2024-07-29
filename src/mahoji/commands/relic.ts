import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

import { relics } from '../../lib/randomizer';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import type { OSBMahojiCommand } from '../lib/util';

export const relicCommand: OSBMahojiCommand = {
	name: 'relic',
	description: 'Pick/view relics.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'pick',
			description: 'Pick one starter relic.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'relic',
					required: true,
					description: 'The relic you want to pick.',
					choices: relics.map(i => ({ name: i.name, value: i.name }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View relics.'
		}
	],
	run: async ({
		interaction,
		options,
		userID
	}: CommandRunOptions<{
		pick?: { relic?: string };
		view?: {};
	}>) => {
		const user = await mUserFetch(userID);
		if (options.pick) {
			if (user.user.relics.length === 0) {
				const pickedRelic = relics.find(r => r.name === options.pick?.relic);
				if (!pickedRelic) {
					return 'Invalid relic.';
				}
				await handleMahojiConfirmation(
					interaction,
					`Are you sure you want to pick the ${pickedRelic.name} relic? You cannot switch.`
				);
				await user.update({
					relics: {
						push: pickedRelic.id
					}
				});
				return `You picked the ${pickedRelic.name} relic.`;
			}
		}

		return relics
			.map(r => `${r.name}: ${r.desc} ${user.user.relics.includes(r.id) ? '(Owned)' : '(Not Owned)'}`)
			.join('\n');
	}
};
