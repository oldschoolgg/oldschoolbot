import creatures from '@/lib/skilling/skills/hunter/creatures/index.js';
import { rumourBlock, rumourBlockList, rumourUnblock } from '@/lib/skilling/skills/hunter/rumours/rumourBlocks.js';
import { rumourCount, rumoursCommand } from '@/lib/skilling/skills/hunter/rumours/rumours.js';
import { RumourHunters } from '@/lib/skilling/skills/hunter/rumours/util.js';

export const rumourCommand = defineCommand({
	name: 'rumours',
	description: 'Various commands related to completing Hunter Rumours.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/rumours start tier:aco']
	},
	options: [
		{
			type: 'Subcommand',
			name: 'start',
			description: 'Send your minion to complete rumours for members of the Hunter Guild.',
			required: false,
			options: [
				{
					type: 'String',
					name: 'tier',
					description:
						'The guild hunter to complete rumours with. Defaults to a hunter of the highest available tier.',
					required: false,
					choices: RumourHunters.map(hunter => ({ value: hunter.id, name: hunter.label }))
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'manage',
			description: 'Block and Unblock various rumours.',
			required: false,
			options: [
				{
					type: 'Subcommand',
					name: 'block',
					description: 'Hold a creature with one guild hunter to block it from appearing with the others.',
					required: false,
					options: [
						{
							type: 'String',
							name: 'tier',
							description: 'The guild hunter who will hold the blocked creature.',
							required: true,
							choices: RumourHunters.map(hunter => ({ value: hunter.id, name: hunter.label }))
						},
						{
							type: 'String',
							name: 'creature',
							description: 'The creature to block',
							required: true,
							autocomplete: async ({ value }: StringAutoComplete) => {
								return creatures
									.filter(c => c.tier)
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
					type: 'Subcommand',
					name: 'unblock',
					description: 'Unblock a creature in a certain tier.',
					required: false,
					options: [
						{
							type: 'String',
							name: 'creature',
							description: 'The creature to unblock',
							required: true,
							autocomplete: async ({ value, user }: StringAutoComplete) => {
								const blockList = Object.values(user.rumourBlockList);
								if (blockList.length === 0) {
									return [];
								}

								const blockedCreatures = blockList
									.map(cId => creatures.find(c => c.id === cId))
									.filter(c => c !== undefined);

								return blockedCreatures
									.filter(c => (!value ? true : c.name.toLowerCase().includes(value.toLowerCase())))
									.map(c => {
										return { name: c.name, value: c.name };
									});
							}
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'list',
					description: 'List your currently blocked creatures.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'count',
			description: 'View how many rumours you have completed.',
			required: false
		}
	],
	run: async ({ user, options, channelId }) => {
		if (options.start) {
			return rumoursCommand(user, channelId, options.start.tier);
		} else if (options.manage) {
			if (options.manage.block) {
				return rumourBlock(user, options.manage.block.tier, options.manage.block.creature);
			} else if (options.manage.unblock) {
				return rumourUnblock(user, options.manage.unblock.creature);
			} else {
				return rumourBlockList(user);
			}
		} else {
			return rumourCount(user);
		}
	}
});
