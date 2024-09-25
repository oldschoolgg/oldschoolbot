import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { User } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';

import { PoHObjects } from '../../lib/poh';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import {
	getPOH,
	makePOHImage,
	pohBuildCommand,
	pohDestroyCommand,
	pohListItemsCommand,
	pohMountItemCommand,
	pohWallkitCommand,
	pohWallkits
} from '../lib/abstracted_commands/pohCommand';
import { ownedItemOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';

export const pohCommand: OSBMahojiCommand = {
	name: 'poh',
	description: 'Allows you to access and build in your POH.',
	attributes: {
		requiresMinion: true,
		examples: ['/poh build:Demonic throne']
	},
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View your PoH.',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'build_mode',
					description: 'View the slots in your PoH.',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'wallkit',
			description: 'Change the wallkit of your PoH.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The wallkit you want to pick.',
					required: true,
					choices: pohWallkits.map(i => ({ name: i.name, value: i.name }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'build',
			description: 'Build things in your PoH.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The object you want to build.',
					required: true,
					autocomplete: async (value: string) => {
						return PoHObjects.filter(i =>
							!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
						).map(i => ({
							name: i.name,
							value: i.name
						}));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'destroy',
			description: 'Destroy/remove things from your PoH.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The object you want to destroy.',
					required: true,
					autocomplete: async (value: string, user: User) => {
						const poh = await getPOH(user.id);
						return PoHObjects.filter(obj => poh[obj.slot] === obj.id)
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'mount_item',
			description: 'Mount an item into your PoH.',
			options: [
				{
					...ownedItemOption(),
					name: 'name',
					description: 'The item you want to mount.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'items',
			description: 'List the buildable items in your POH.'
		}
	],
	run: async ({
		options,
		userID,
		interaction
	}: CommandRunOptions<{
		view?: { build_mode?: boolean };
		wallkit?: { name: string };
		build?: { name: string };
		destroy?: { name: string };
		mount_item?: { name: string };
		items?: { name: string };
	}>) => {
		const user = await mUserFetch(userID);
		if (!user.hasMinion) return "You don't own a minion yet, so you have no PoH!";
		if (options.view) {
			return makePOHImage(user, options.view.build_mode);
		}
		if (options.wallkit) {
			return pohWallkitCommand(user, options.wallkit.name);
		}
		if (minionIsBusy(user.id)) return 'You cannot interact with your PoH, because your minion is busy.';
		if (options.build) {
			return pohBuildCommand(interaction, user, options.build.name);
		}
		if (options.destroy) {
			return pohDestroyCommand(user, options.destroy.name);
		}
		if (options.mount_item) {
			return pohMountItemCommand(user, options.mount_item.name);
		}
		if (options.items) {
			return pohListItemsCommand();
		}
		return 'Invalid command.';
	}
};
