import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import {
	BathhouseOres,
	bathhouseTierNames,
	BathwaterMixtures,
	baxtorianBathhousesStartCommand
} from '../../lib/baxtorianBathhouses';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const minigamesCommand: OSBMahojiCommand = {
	name: 'bsominigames',
	description: 'Send your minion to do various bso minigames.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'baxtorian_bathhouses',
			description: 'The Baxtorian Bathhouses minigame.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'help',
					description: 'Show some helpful information about the minigame.'
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'start',
					description: 'Start a Baxtorian Bathhouses minigame trip.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							description: 'The tier of bath you want to run.',
							required: true,
							choices: bathhouseTierNames.map(i => ({ name: i, value: i }))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'ore',
							description: 'The ore you want to use to heat the boilers.',
							required: false,
							choices: BathhouseOres.map(i => ({
								name: `${i.item.name} + ${i.logs.name} (Usable at ${i.tiers.join(', ')})`,
								value: i.item.name
							}))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'water_mixture',
							description: 'The herbs you want to use for your water mixture.',
							required: false,
							choices: BathwaterMixtures.map(i => ({
								name: `${i.name} (${i.items.map(i => i.name).join(', ')})`,
								value: i.name
							}))
						}
					]
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		baxtorian_bathhouses?: {
			help?: {};
			start?: { tier: string; ore?: string; water_mixture?: string };
		};
	}>) => {
		const klasaUser = await client.fetchUser(userID);
		const user = await mahojiUsersSettingsFetch(userID);
		const { baxtorian_bathhouses } = options;

		if (baxtorian_bathhouses?.help) {
			return;
		}

		if (baxtorian_bathhouses?.start) {
			return baxtorianBathhousesStartCommand({
				channelID,
				user,
				klasaUser,
				tier: baxtorian_bathhouses.start.tier,
				ore: baxtorian_bathhouses.start.ore,
				mixture: baxtorian_bathhouses.start.water_mixture
			});
		}

		return 'Invalid command.';
	}
};
