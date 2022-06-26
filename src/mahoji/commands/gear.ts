import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { allPetIDs } from '../../lib/data/CollectionsExport';
import { GearSetupType, GearStat } from '../../lib/gear';
import { equipPet } from '../../lib/minions/functions/equipPet';
import { unequipPet } from '../../lib/minions/functions/unequipPet';
import { itemNameFromID } from '../../lib/util';
import { gearEquipCommand, gearStatsCommand, gearUnequipCommand } from '../lib/abstracted_commands/gearCommands';
import { equippedItemOption, gearPresetOption, gearSetupOption, ownedItemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { getMahojiBank, mahojiUsersSettingsFetch } from '../mahojiSettings';

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
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'auto',
					description: 'Automatically equip the best gear you have for a certain style.',
					required: false,
					choices: Object.values(GearStat).map(k => ({ name: k, value: k }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'unequip',
			description: 'Unequip an item from one of your gear setups.',
			options: [
				{
					...gearSetupOption,
					required: true
				},
				{
					...equippedItemOption(),
					name: 'item',
					description: 'The item you want to unequip.',
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'all',
					description: 'Unequip everything in this setup?',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'stats',
			description: 'Check the gear stats of a list of items, regardless if you own them or not.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'gear_setup',
					description: 'A list of equippable items to check the stats of.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'pet',
			description: 'Equip or unequip a pet.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'equip',
					description: 'Equip a pet.',
					required: false,
					autocomplete: async (value, user) => {
						const bank = getMahojiBank(await mahojiUsersSettingsFetch(user.id));
						return allPetIDs
							.filter(i => bank.has(i))
							.map(i => itemNameFromID(i)!)
							.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i, value: i }));
					}
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'unequip',
					description: 'Unequip your pet.',
					required: false
				}
			]
		}
	],
	run: async ({
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		equip?: { gear_setup: GearSetupType; item?: string; preset?: string; quantity?: number; auto?: string };
		unequip?: { gear_setup: GearSetupType; item?: string; all?: boolean };
		stats?: { gear_setup: string };
		pet?: { equip?: string; unequip?: string };
	}>) => {
		const klasaUser = await globalClient.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);
		if (options.equip) {
			return gearEquipCommand({
				interaction,
				user: mahojiUser,
				klasaUser,
				setup: options.equip.gear_setup,
				item: options.equip.item,
				preset: options.equip.preset,
				quantity: options.equip.quantity,
				unEquippedItem: undefined,
				auto: options.equip.auto
			});
		}
		if (options.unequip) {
			return gearUnequipCommand(
				klasaUser,
				mahojiUser,
				options.unequip.gear_setup,
				options.unequip.item,
				options.unequip.all
			);
		}
		if (options.stats) return gearStatsCommand(mahojiUser, options.stats.gear_setup);
		if (options.pet?.equip) return equipPet(klasaUser, options.pet.equip);
		if (options.pet?.unequip) return unequipPet(klasaUser);

		return 'Invalid command.';
	}
};
