import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Monsters } from 'oldschooljs';

import { determineKillLimit } from '../../commands/deprecated/kill';
import { PerkTier } from '../../lib/constants';
import { stringMatches, toTitleCase } from '../../lib/util';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { Workers } from '../../lib/workers';
import { OSBMahojiCommand } from '../lib/util';

export const killCommand: OSBMahojiCommand = {
	name: 'kill',
	description: 'Simulate killing monsters.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The monster you want to simulate killing.',
			required: true,
			autocomplete: async (value: string) => {
				return [
					...Monsters.map(i => ({ name: i.name, aliases: i.aliases })),
					{ name: 'nex', aliases: ['nex'] },
					{ name: 'nightmare', aliases: ['nightmare'] },
					{ name: 'Moktang', aliases: ['moktang'] }
				]
					.filter(i => (!value ? true : i.aliases.some(alias => alias.includes(value.toLowerCase()))))
					.map(i => ({
						name: i.name,
						value: i.name
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to simulate.',
			required: true,
			min_value: 1
		}
	],
	run: async ({ options, userID, interaction }: CommandRunOptions<{ name: string; quantity: number }>) => {
		const user = await globalClient.fetchUser(userID);
		interaction.deferReply();
		const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, options.name)));

		let limit = determineKillLimit(user);
		if (osjsMonster?.isCustom) {
			if (user.perkTier < PerkTier.Four) {
				return 'Simulating kills of custom monsters is a T3 perk!';
			}
			limit /= 4;
		}

		const result = await Workers.kill({
			quantity: options.quantity,
			bossName: options.name,
			limit,
			catacombs: false,
			onTask: false
		});

		if (result.error) {
			return result.error;
		}

		const bank = new Bank(result.bank?.bank);
		const image = await makeBankImage({
			bank,
			title: result.title ?? `Loot from ${options.quantity.toLocaleString()} ${toTitleCase(options.name)}`,
			user
		});

		return {
			attachments: [image.file],
			content: result.content
		};
	}
};
