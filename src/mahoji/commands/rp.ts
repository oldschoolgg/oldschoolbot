import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import type { MahojiUserOption } from '@oldschoolgg/toolkit';
import { codeBlock } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { randArrItem } from 'e';

import { calculateCompCapeProgress } from '../../lib/bso/calculateCompCapeProgress';
import { globalConfig } from '../../lib/constants';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import type { OSBMahojiCommand } from '../lib/util';
import { gifs } from './admin';

export const rpCommand: OSBMahojiCommand = {
	name: 'rp',
	description: 'Admin tools second set',
	guildID: globalConfig.mainServerID,
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'action',
			description: 'Action tools',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'force_comp_update',
					description: 'Force the top 100 completionist users to update their completion percentage.',
					options: []
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'player',
			description: 'Player manipulation tools',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'viewbank',
					description: 'View a users bank.',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user.',
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'json',
							description: 'Get bank in JSON format',
							required: false
						}
					]
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		action?: {
			force_comp_update?: {};
		};
		player?: {
			viewbank?: { user: MahojiUserOption; json?: boolean };
			view_user?: { user: MahojiUserOption };
		};
	}>) => {
		await deferInteraction(interaction);

		const mods = [
			'794368001856110594',
			'604278562320810009',
			'425134194436341760',
			'157797566833098752',
			'507686806624534529'
		];
		if (!mods.includes(userID)) return randArrItem(gifs);

		// Mod+ only commands:
		if (options.action?.force_comp_update) {
			const usersToUpdate = await prisma.userStats.findMany({
				where: {
					untrimmed_comp_cape_percent: {
						not: null
					}
				},
				orderBy: {
					untrimmed_comp_cape_percent: 'desc'
				},
				take: 100
			});
			for (const user of usersToUpdate) {
				await calculateCompCapeProgress(await mUserFetch(user.user_id.toString()));
			}
			return 'Done.';
		}

		if (options.player?.viewbank) {
			const userToCheck = await mUserFetch(options.player.viewbank.user.user.id);
			const bank = userToCheck.allItemsOwned;
			if (options.player?.viewbank.json) {
				const json = JSON.stringify(bank.bank);
				if (json.length > 1900) {
					return { files: [{ attachment: Buffer.from(json), name: 'bank.json' }] };
				}
				return `${codeBlock('json', json)}`;
			}
			return { files: [(await makeBankImage({ bank, title: userToCheck.usernameOrMention })).file] };
		}

		return 'Invalid command.';
	}
};
