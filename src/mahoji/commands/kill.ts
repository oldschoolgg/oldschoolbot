import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank, Monsters } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import { stringMatches, toTitleCase } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { Workers } from '../../lib/workers';
import { OSBMahojiCommand } from '../lib/util';

export function determineKillLimit(user: KlasaUser) {
	if (globalClient.owners.has(user)) {
		return Infinity;
	}

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
