import { toTitleCase } from '@oldschoolgg/toolkit';
import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank, Monsters } from 'oldschooljs';

import { PerkTier } from '../../lib/constants';
import { simulatedKillables } from '../../lib/simulation/simulatedKillables';
import { stringMatches } from '../../lib/util';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { Workers } from '../../lib/workers';
import type { OSBMahojiCommand } from '../lib/util';

function determineKillLimit(user: MUser) {
	const perkTier = user.perkTier();

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
					...simulatedKillables.map(i => ({ name: i.name, aliases: [i.name] }))
				]
					.filter(i =>
						!value ? true : i.aliases.some(alias => alias.toLowerCase().includes(value.toLowerCase()))
					)
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
		await deferInteraction(interaction);
		const osjsMonster = Monsters.find(mon => mon.aliases.some(alias => stringMatches(alias, options.name)));
		const simulatedKillable = simulatedKillables.find(i => stringMatches(i.name, options.name));

		let limit = determineKillLimit(user);
		if (osjsMonster && 'isCustom' in osjsMonster) {
			if (user.perkTier() < PerkTier.Four) {
				return 'Simulating kills of custom monsters is a T3 perk!';
			}
			limit /= 4;
		}

		if (simulatedKillable?.isCustom) {
			if (user.perkTier() < PerkTier.Four) {
				return 'Simulating kills of custom monsters or raids is a T3 perk!';
			}
			limit /= 4;
		}

		const result = await Workers.kill({
			quantity: options.quantity,
			bossName: options.name,
			limit,
			catacombs: false,
			onTask: false,
			lootTableTertiaryChanges: Array.from(user.buildTertiaryItemChanges().entries())
		});

		if (result.error) {
			return result.error;
		}

		const image = await makeBankImage({
			bank: new Bank(result.bank),
			title: result.title ?? `Loot from ${options.quantity.toLocaleString()} ${toTitleCase(options.name)}`,
			user
		});

		return {
			files: [image.file],
			content: result.content
		};
	}
};
