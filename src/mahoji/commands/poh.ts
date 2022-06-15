import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { PoHObjects } from '../../lib/poh';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import {
	getPOH,
	makePOHImage,
	pohBuildCommand,
	pohDestroyCommand,
	pohMountItemCommand,
	pohWallkitCommand,
	pohWallkits
} from '../lib/abstracted_commands/pohCommand';
import { OSBMahojiCommand } from '../lib/util';
import { getSkillsOfMahojiUser, mahojiUsersSettingsFetch } from '../mahojiSettings';

export const pohCommand: OSBMahojiCommand = {
	name: 'poh',
	description: 'Allows you to access and build in your POH.',
	attributes: {
		requiresMinion: true,
		description: 'Allows you to access and build in your POH.',
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
					autocomplete: async (value: string, user: APIUser) => {
						const skills = getSkillsOfMahojiUser(await mahojiUsersSettingsFetch(user.id), true);
						return PoHObjects.filter(i => i.level <= skills.construction)
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
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
					autocomplete: async (value: string, user: APIUser) => {
						const poh = await getPOH(user.id);
						return PoHObjects.filter(obj => poh[obj.slot] !== obj.id)
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'mountitem',
			description: 'Mount an item into your PoH.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The item you want to mount.',
					required: true,
					autocomplete: async (value, user) => {
						const mUser = await mahojiUsersSettingsFetch(user.id, { bank: true });
						const bank = new Bank(mUser.bank as ItemBank);
						let res = bank.items().filter(i => i[0].name.toLowerCase().includes(value.toLowerCase()));
						return res.map(i => ({ name: `${i[0].name}`, value: i[0].name.toString() }));
					}
				}
			]
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
		mountitem?: { name: string };
	}>) => {
		const user = await globalClient.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);
		if (!mahojiUser.minion_hasBought) return "You don't own a minion yet, so you have no PoH!";
		if (options.view) {
			return makePOHImage(user, options.view?.build_mode);
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
		if (options.mountitem) {
			return pohMountItemCommand(user, options.mountitem.name);
		}
		return 'Invalid command.';
	}
};
