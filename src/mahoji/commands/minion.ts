import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { diaries } from '../../lib/diaries';
import getOSItem from '../../lib/util/getOSItem';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';
import BankImageTask from '../../tasks/bankImage';
import {
	achievementDiaryCommand,
	claimAchievementDiaryCommand
} from '../lib/abstracted_commands/achievementDiaryCommand';
import { bankBgCommand } from '../lib/abstracted_commands/bankBgCommand';
import { cancelTaskCommand } from '../lib/abstracted_commands/cancelTaskCommand';
import { crackerCommand } from '../lib/abstracted_commands/crackerCommand';
import { Lampables, lampCommand } from '../lib/abstracted_commands/lampCommand';
import { allUsableItems, useCommand } from '../lib/abstracted_commands/useCommand';
import { ownedItemOption, skillOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { MahojiUserOption, mahojiUsersSettingsFetch } from '../mahojiSettings';

export const minionCommand: OSBMahojiCommand = {
	name: 'minion',
	description: 'Manage and control your minion.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cracker',
			description: 'Use a Christmas Cracker on someone.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user you want to use the cracker on.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stats',
			description: 'Check the stats of your minion.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'achievementdiary',
			description: 'Manage your achievement diary.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'diary',
					description: 'The achievement diary name.',
					required: false,
					choices: diaries.map(i => ({ name: i.name, value: i.name }))
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'claim',
					description: 'Claim your rewards?',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'bankbg',
			description: 'Change your bank background.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name of the bank background you want.',
					autocomplete: async value => {
						const bankImages = (globalClient.tasks.get('bankImage') as BankImageTask).backgroundImages;
						return bankImages
							.filter(bg => (!value ? true : bg.available))
							.filter(bg => (!value ? true : bg.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => {
								const name = i.perkTierNeeded
									? `${i.name} (Tier ${i.perkTierNeeded - 1} patrons)`
									: i.name;
								return { name, value: i.name };
							});
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'lamp',
			description: 'Use lamps to claim XP.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to use.',
					autocomplete: async (value: string) => {
						return Lampables.map(i => i.items)
							.flat(2)
							.map(getOSItem)
							.filter(p => (!value ? true : p.name.toLowerCase().includes(value.toLowerCase())))
							.map(p => ({ name: p.name, value: p.name }));
					},
					required: true
				},
				{
					...skillOption,
					required: true,
					name: 'skill',
					description: 'The skill you want to use the item on.'
				},
				{
					type: ApplicationCommandOptionType.Number,
					name: 'quantity',
					description: 'You quantity you want to use.',
					required: false,
					min_value: 1,
					max_value: 100_000
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cancel',
			description: 'Cancel your current trip.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'use',
			description: 'Allows you to use items.',
			options: [
				{
					...ownedItemOption(i => allUsableItems.has(i.id)),
					required: true,
					name: 'item'
				},
				{
					...ownedItemOption(i => allUsableItems.has(i.id)),
					required: false,
					name: 'secondary_item',
					description: 'Optional second item to use the first one on.'
				}
			]
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{
		stats?: {};
		achievementdiary?: { diary?: string; claim?: boolean };
		bankbg?: { name?: string };
		cracker?: { user: MahojiUserOption };
		lamp?: { item: string; quantity?: number; skill: string };
		cancel?: {};
		use?: { item: string; secondary_item?: string };
	}>) => {
		const user = await globalClient.fetchUser(userID.toString());
		const mahojiUser = await mahojiUsersSettingsFetch(user.id);

		if (options.stats) {
			return { embeds: [await minionStatsEmbed(user)] };
		}

		if (options.achievementdiary) {
			if (options.achievementdiary.claim) {
				return claimAchievementDiaryCommand(user, options.achievementdiary.diary ?? '');
			}
			return achievementDiaryCommand(user, options.achievementdiary.diary ?? '');
		}

		if (options.bankbg) {
			return bankBgCommand(interaction, user, options.bankbg.name ?? '');
		}
		if (options.cracker) {
			const otherUser = await globalClient.fetchUser(options.cracker.user.user.id);
			return crackerCommand({ owner: user, otherPerson: otherUser, interaction });
		}

		if (options.lamp) {
			return lampCommand(user, options.lamp.item, options.lamp.skill, options.lamp.quantity);
		}

		if (options.cancel) return cancelTaskCommand(mahojiUser, interaction);

		if (options.use) return useCommand(mahojiUser, user, options.use.item, options.use.secondary_item);

		return 'Unknown command';
	}
};
