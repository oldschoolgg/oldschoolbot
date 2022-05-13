import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import {
	BathhouseOres,
	bathHouseTiers,
	BathwaterMixtures,
	baxBathHelpStr,
	baxBathSim,
	baxtorianBathhousesStartCommand
} from '../../lib/baxtorianBathhouses';
import { toTitleCase } from '../../lib/util';
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
							choices: bathHouseTiers.map(i => ({
								name: `${i.name} (${Object.entries(i.skillRequirements)
									.map(i => `${i[1]} ${toTitleCase(i[0])}`)
									.join(', ')})`,
								value: i.name
							}))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'heating',
							description: 'The heating you want to use to heat the boilers.',
							required: true,
							choices: BathhouseOres.map(i => ({
								name: `${i.item.name} + ${i.logs.name} (Usable at ${i.tiers.join(', ')})`,
								value: i.item.name
							}))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'water_mixture',
							description: 'The herbs you want to use for your water mixture.',
							required: true,
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
			start?: { tier: string; heating?: string; water_mixture?: string };
		};
	}>) => {
		const klasaUser = await client.fetchUser(userID);
		const user = await mahojiUsersSettingsFetch(userID);
		const { baxtorian_bathhouses } = options;

		if (baxtorian_bathhouses?.help) {
			if (1 > 0) {
				const sim = baxBathSim();
				return {
					attachments: [{ fileName: 'sim.txt', buffer: Buffer.from(sim) }]
				};
			}
			return baxBathHelpStr;
		}

		if (baxtorian_bathhouses?.start) {
			return baxtorianBathhousesStartCommand({
				channelID,
				user,
				klasaUser,
				tier: baxtorian_bathhouses.start.tier,
				ore: baxtorian_bathhouses.start.heating,
				mixture: baxtorian_bathhouses.start.water_mixture
			});
		}

		return 'Invalid command.';
	}
};
