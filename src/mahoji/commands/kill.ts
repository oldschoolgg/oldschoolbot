import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Monsters } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import { toTitleCase } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { Workers } from '../../lib/workers';
import { OSBMahojiCommand } from '../lib/util';

export function determineKillLimit(user: MUser) {
	const perkTier = getUsersPerkTier(user);

	if (perkTier >= PerkTier.Six) {
		return 1_000_000;
	}

	if (perkTier >= PerkTier.Five) {
		return 600_000;
	}

	if (perkTier >= PerkTier.Four) {
		return 400_000;
	}

	if (perkTier === PerkTier.Three) {
		return 250_000;
	}

	if (perkTier === PerkTier.Two) {
		return 100_000;
	}

	if (perkTier === PerkTier.One) {
		return 50_000;
	}

	return 10_000;
}

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
					{ name: 'nightmare', aliases: ['nightmare'] }
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
		const user = await mUserFetch(userID);
		deferInteraction(interaction);

		const result = await Workers.kill({
			quantity: options.quantity,
			bossName: options.name,
			limit: determineKillLimit(user),
			catacombs: false,
			onTask: false
		});

		if (result.error) {
			return result.error;
		}

		const image = await makeBankImage({
			bank: new Bank(result.bank?.bank),
			title: result.title ?? `Loot from ${options.quantity.toLocaleString()} ${toTitleCase(options.name)}`,
			user
		});
		return {
			files: [image.file],
			content: result.content
		};
	}
};
