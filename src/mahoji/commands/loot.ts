import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import { PerkTier } from '../../lib/constants';
import { getAllTrackedLootForUser, getDetailsOfSingleTrackedLoot } from '../../lib/lootTrack';

import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import type { OSBMahojiCommand } from '../lib/util';

export const lootCommand: OSBMahojiCommand = {
	name: 'loot',
	description: 'View your loot tracker data.',
	attributes: {
		examples: ['/loot view name:Nex']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View your tracked loot for a certain thing.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The thing you want to view.',
					required: true,
					autocomplete: async (value: string, user) => {
						return (await getAllTrackedLootForUser(user.id))
							.filter(i => (!value ? true : i.key.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({
								name: i.key,
								value: i.id
							}));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'reset',
			description: 'Reset one of your loot trackers.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The thing you want to reset.',
					required: true,
					autocomplete: async (value: string, user) => {
						return (await getAllTrackedLootForUser(user.id))
							.filter(i => (!value ? true : i.key.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({
								name: i.key,
								value: i.id
							}));
					}
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{ view?: { name: string }; reset?: { name: string } }>) => {
		const user = await mUserFetch(userID);
		const name = options.view?.name ?? options.reset?.name ?? '';
		if (user.perkTier() < PerkTier.Four) {
			const res = await prisma.lootTrack.count({
				where: {
					user_id: BigInt(userID)
				}
			});
			return `You need to be a Tier 3 Patron to use this feature. You have ${res}x loot trackers stored currently.`;
		}

		const trackedLoot = await prisma.lootTrack
			.findFirst({
				where: {
					id: name,
					user_id: BigInt(userID)
				}
			})
			.catch(() => null);
		if (!trackedLoot) {
			return "The name you specified doesn't exist.";
		}

		if (options.view) {
			return getDetailsOfSingleTrackedLoot(user, trackedLoot);
		}
		if (options.reset) {
			await handleMahojiConfirmation(interaction, 'Are you sure you want to reset this loot tracker?');
			await prisma.lootTrack.delete({
				where: {
					id: trackedLoot.id
				}
			});
			const current = await getDetailsOfSingleTrackedLoot(user, trackedLoot);
			current.content = `**You reset this loot tracker:\n\n${current.content}`;
			return current;
		}

		return 'Invalid command.';
	}
};
