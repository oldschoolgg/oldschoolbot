import { choicesOf, ownedItemOption } from '@/discord/index.js';
import { PoHObjects } from '@/lib/poh/index.js';
import {
	getPOH,
	makePOHImage,
	pohBuildCommand,
	pohDestroyCommand,
	pohListItemsCommand,
	pohMountItemCommand,
	pohWallkitCommand,
	pohWallkits
} from '@/mahoji/lib/abstracted_commands/pohCommand.js';

export const pohCommand = defineCommand({
	name: 'poh',
	description: 'Allows you to access and build in your POH.',
	attributes: {
		requiresMinion: true,
		examples: ['/poh build:Demonic throne']
	},
	options: [
		{
			type: 'Subcommand',
			name: 'view',
			description: 'View your PoH.',
			options: [
				{
					type: 'Boolean',
					name: 'build_mode',
					description: 'View the slots in your PoH.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'wallkit',
			description: 'Change the wallkit of your PoH.',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The wallkit you want to pick.',
					required: true,
					choices: choicesOf(pohWallkits.map(i => i.name))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'build',
			description: 'Build things in your PoH.',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The object you want to build.',
					required: true,
					autocomplete: async ({ value }: StringAutoComplete) => {
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
			type: 'Subcommand',
			name: 'destroy',
			description: 'Destroy/remove things from your PoH.',
			options: [
				{
					type: 'String',
					name: 'name',
					description: 'The object you want to destroy.',
					required: true,
					autocomplete: async ({ value, userId }: StringAutoComplete) => {
						const poh = await getPOH(userId);
						return PoHObjects.filter(obj => poh[obj.slot] === obj.id)
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: 'Subcommand',
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
			type: 'Subcommand',
			name: 'items',
			description: 'List the buildable items in your POH.'
		}
	],
	run: async ({ options, user, interaction }) => {
		if (!user.hasMinion) return "You don't own a minion yet, so you have no PoH!";

		if (options.view) {
			return { files: [await makePOHImage(interaction, { showSpaces: options.view.build_mode })] };
		}
		if (options.wallkit) {
			return pohWallkitCommand(interaction, options.wallkit.name);
		}
		if (await user.minionIsBusy()) return 'You cannot interact with your PoH, because your minion is busy.';
		if (options.build) {
			return pohBuildCommand(interaction, options.build.name);
		}
		if (options.destroy) {
			return pohDestroyCommand(interaction, options.destroy.name);
		}
		if (options.mount_item) {
			return pohMountItemCommand(interaction, options.mount_item.name);
		}
		if (options.items) {
			return pohListItemsCommand();
		}
		return 'Invalid command.';
	}
});
