import { ApplicationCommandOptionType } from 'discord-api-types';
import { CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { GearSetupType } from '../../lib/gear';
import { gearEquipCommand } from '../lib/abstracted_commands/gearCommands';
import { gearPresetOption, gearSetupOption, ownedItemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

export const gearCommand: OSBMahojiCommand = {
	name: 'gear',
	description: 'Manage, equip, unequip your gear.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'equip',
			description: 'Equip an item or preset to one of your gear setups.',
			options: [
				{
					...gearSetupOption,
					required: true
				},
				{
					...ownedItemOption(item => Boolean(item.equipable_by_player) && Boolean(item.equipment)),
					name: 'item',
					description: 'The item you want to equip.'
				},
				{
					...gearPresetOption,
					required: false,
					name: 'preset'
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The quantity you want to equip (optional).',
					required: false,
					min_value: 1
				}
			]
		}
	],
	run: async ({
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		equip?: { setup: GearSetupType; item?: string; preset?: string; quantity?: number };
	}>) => {
		const klasaUser = await client.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);

		if (options.equip) {
			return gearEquipCommand({
				interaction,
				user: mahojiUser,
				klasaUser,
				setup: options.equip.setup,
				item: options.equip.item,
				preset: options.equip.preset,
				quantity: options.equip.quantity,
				unEquippedItem: undefined
			});
		}
		return 'Invalid command.';
	}
};
