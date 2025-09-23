import type { OSBMahojiCommand } from '@oldschoolgg/toolkit/discord-util';
import { type CommandRunOptions, toTitleCase } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Bank } from 'oldschooljs';

import { PerkTier } from '@/lib/constants';
import { autocompleteMonsters } from '@/lib/minions/data/killableMonsters';
import { simulatedKillables } from '@/lib/simulation/simulatedKillables';
import { slayerMasterChoices } from '@/lib/slayer/constants';
import { slayerMasters } from '@/lib/slayer/slayerMasters';
import { deferInteraction } from '@/lib/util/interactionReply';
import { makeBankImage } from '@/lib/util/makeBankImage';
import { Workers } from '@/lib/workers';

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

const ALL_VALID_KILLABLE_MONSTERS = [
	...autocompleteMonsters.map(i => ({ name: i.name, aliases: i.aliases })),
	...simulatedKillables.map(i => ({ name: i.name, aliases: [i.name] })),
	{ name: 'nightmare', aliases: ['nightmare'] }
];

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
				return ALL_VALID_KILLABLE_MONSTERS.filter(i =>
					!value ? true : i.aliases.some(alias => alias.toLowerCase().includes(value.toLowerCase()))
				).map(i => ({
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
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'catacombs',
			description: 'Killing in catacombs?',
			required: false
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'master',
			description: 'On slayer task from a master?',
			required: false,
			choices: slayerMasterChoices
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'ori',
			description: 'Apply Ori pet bonus to loot?',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{ name: string; quantity: number; catacombs: boolean; master: string; ori?: boolean }>) => {
		const user = await mUserFetch(userID);
		await deferInteraction(interaction);
		if (!ALL_VALID_KILLABLE_MONSTERS.some(i => i.name.toLowerCase() === options.name.toLowerCase())) {
			return `That's not a valid monster to simulate killing.`;
		}
		const result = await Workers.kill({
			quantity: options.quantity,
			bossName: options.name,
			limit: determineKillLimit(user),
			catacombs: options.catacombs,
			onTask: options.master !== undefined,
			slayerMaster: slayerMasters.find(sMaster => sMaster.name === options.master)?.osjsEnum,
			ori: options.ori ?? false,
			lootTableTertiaryChanges: Array.from(
				user
					.buildTertiaryItemChanges(false, options.master === 'Krystilia', options.master !== undefined)
					.entries()
			)
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
