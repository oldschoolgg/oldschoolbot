import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType, type User } from 'discord.js';
import creatures from '../../lib/skilling/skills/hunter/creatures';
import {
	getRumourBlockList,
	rumourBlock,
	rumourBlockList,
	rumourUnblock
} from '../../lib/skilling/skills/hunter/rumours/rumourBlocks';
import { rumourCount, rumoursCommand } from '../../lib/skilling/skills/hunter/rumours/rumours';
import { type RumourOption, RumourOptions } from '../../lib/skilling/skills/hunter/rumours/util';
import type { OSBMahojiCommand } from '../lib/util';

export const rumourCommand: OSBMahojiCommand = {
	name: 'rumours',
	description: 'Various commands related to completing Hunter Rumours.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/rumours start tier:novice']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'start',
			description: 'Send your minion to complete rumours for members of the Hunter Guild.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'tier',
					description: 'The rumour tier you wish to be assigned. (Will default to the highest tier)',
					required: false,
					choices: RumourOptions.map(i => ({ value: i, name: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'manage',
			description: 'Block and Unblock various rumours.',
			required: false,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'block',
					description: 'Block a creature in a certain tier from appearing in any tier of rumour.',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'tier',
							description: 'The tier of the block slot you want to use.',
							required: true,
							choices: RumourOptions.map(i => ({ value: i, name: i }))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'creature',
							description: 'The creature to block',
							required: true,
							autocomplete: async (value: string) => {
								return creatures
									.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
									.map(i => ({
										name: i.name,
										value: i.name
									}));
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'unblock',
					description: 'Unblock a creature in a certain tier.',
					required: false,
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'creature',
							description: 'The creature to unblock',
							required: true,
							autocomplete: async (value: string, user: User) => {
								const blocklist = (await getRumourBlockList(user.id)).rumour_blocked_ids;
								if (blocklist.reduce((acc, a) => acc + a) === 0) {
									return [{ name: "You don't have any creatures blocked", value: '' }];
								}

								const blockedCreatures = blocklist
									.map(cId => creatures.find(c => c.id === cId))
									.filter(c => c !== undefined);

								return blockedCreatures
									.filter(c => (!value ? true : c!.name.toLowerCase().includes(value.toLowerCase())))
									.map(c => {
										return { name: c!.name, value: c!.name };
									});
							}
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'list',
					description: 'List your currently blocked creatures.',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'count',
			description: 'View how many rumours you have completed.',
			required: false
		}
	],
	run: async ({
		userID,
		options,
		channelID
	}: CommandRunOptions<{
		start?: { tier?: RumourOption };
		manage?: {
			block?: { tier: RumourOption; creature: string };
			unblock?: { creature: string };
			list?: {};
		};
		count?: {};
	}>) => {
		if (options.start) {
			return rumoursCommand(userID, channelID, options.start.tier);
		} else if (options.manage) {
			const user = await mUserFetch(userID);

			if (options.manage.block) {
				return rumourBlock(user, options.manage.block.tier, options.manage.block.creature);
			} else if (options.manage.unblock) {
				return rumourUnblock(user, options.manage.unblock.creature);
			} else {
				return rumourBlockList(user);
			}
		} else {
			return rumourCount(userID);
		}
	}
};
