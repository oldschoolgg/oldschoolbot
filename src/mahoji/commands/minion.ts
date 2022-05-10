import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { diaries } from '../../lib/diaries';
import { KourendFavours } from '../../lib/minions/data/kourendFavour';
import Potions from '../../lib/minions/data/potions';
import getOSItem from '../../lib/util/getOSItem';
import { minionStatsEmbed } from '../../lib/util/minionStatsEmbed';
import BankImageTask from '../../tasks/bankImage';
import {
	achievementDiaryCommand,
	claimAchievementDiaryCommand
} from '../lib/abstracted_commands/achievementDiaryCommand';
import { bankBgCommand } from '../lib/abstracted_commands/bankBgCommand';
import { collectables, collectCommand } from '../lib/abstracted_commands/collectCommand';
import { crackerCommand } from '../lib/abstracted_commands/crackerCommand';
import { decantCommand } from '../lib/abstracted_commands/decantCommand';
import { favourCommand } from '../lib/abstracted_commands/favourCommand';
import { Lampables, lampCommand } from '../lib/abstracted_commands/lampCommand';
import { questCommand } from '../lib/abstracted_commands/questCommand';
import { skillOption } from '../lib/mahojiCommandOptions';
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
						const bankImages = (client.tasks.get('bankImage') as BankImageTask).backgroundImages;
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
			name: 'quest',
			description: 'Send your minion to do quests.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'favour',
			description: 'Allows you to get Kourend Favour.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name of the Kourend House.',
					choices: KourendFavours.map(i => ({ name: i.name, value: i.name })),
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'no_stams',
					description: "Enable if you don't want to use stamina potions when getting favour.",
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'decant',
			description: 'Allows you to decant potions into different dosages.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'potion_name',
					description: 'The name of the bank background you want.',
					autocomplete: async (value: string) => {
						return Potions.filter(p =>
							!value ? true : p.name.toLowerCase().includes(value.toLowerCase())
						).map(p => ({ name: p.name, value: p.name }));
					},
					required: true
				},
				{
					type: ApplicationCommandOptionType.Number,
					name: 'dose',
					description: 'The dosage to decant them too. (default 4)',
					required: false,
					min_value: 1,
					max_value: 4
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'collect',
			description: 'Sends your minion to collect items.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The item you want to collect.',
					autocomplete: async (value: string) => {
						return collectables
							.filter(p => (!value ? true : p.item.name.toLowerCase().includes(value.toLowerCase())))
							.map(p => ({ name: p.item.name, value: p.item.name }));
					},
					required: true
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
		}
	],
	run: async ({
		userID,
		options,
		channelID,
		interaction
	}: CommandRunOptions<{
		stats?: {};
		achievementdiary?: { diary?: string; claim?: boolean };
		bankbg?: { name?: string };
		cracker?: { user: MahojiUserOption };
		quest?: {};
		favour?: { name?: string; no_stams?: boolean };
		decant?: { potion_name: string; dose?: number };
		collect?: { item: string };
		lamp?: { item: string; quantity?: number; skill: string };
	}>) => {
		const user = await client.fetchUser(userID.toString());
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

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
			const otherUser = await client.fetchUser(options.cracker.user.user.id);
			return crackerCommand({ owner: user, otherPerson: otherUser, interaction });
		}
		if (options.quest) {
			return questCommand(user, channelID);
		}
		if (options.favour) {
			return favourCommand(user, mahojiUser, options.favour.name, channelID, options.favour.no_stams);
		}
		if (options.decant) {
			return decantCommand(user, options.decant.potion_name, options.decant.dose);
		}
		if (options.collect) {
			return collectCommand(mahojiUser, user, channelID, options.collect.item);
		}

		if (options.lamp) {
			return lampCommand(user, options.lamp.item, options.lamp.skill, options.lamp.quantity);
		}

		return 'Unknown command';
	}
};
