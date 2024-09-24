import { toTitleCase } from '@oldschoolgg/toolkit';
import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

import type { GearSetupType } from '@prisma/client';
import { gearValidationChecks } from '../../lib/constants';
import { allPetIDs } from '../../lib/data/CollectionsExport';
import { GearSetupTypes, GearStat } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { equipPet } from '../../lib/minions/functions/equipPet';
import { unequipPet } from '../../lib/minions/functions/unequipPet';
import { itemNameFromID } from '../../lib/util';
import { canvasToBuffer, createCanvas, loadImage } from '../../lib/util/canvasUtil';
import { findBestGearSetups } from '../../lib/util/findBISGear';
import {
	gearEquipCommand,
	gearStatsCommand,
	gearSwapCommand,
	gearUnequipCommand,
	gearViewCommand
} from '../lib/abstracted_commands/gearCommands';
import { equippedItemOption, gearPresetOption, gearSetupOption, ownedItemOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
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
					type: ApplicationCommandOptionType.String,
					name: 'items',
					description: 'A list of equippable items to equip.'
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
						const bank = getMahojiBank(await mahojiUsersSettingsFetch(user.id, { bank: true }));
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
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View your gear.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'setup',
					description: 'The setup you want to view.',
					required: true,
					choices: ['All', ...GearSetupTypes, 'Lost on wildy death'].map(i => ({
						name: toTitleCase(i),
						value: i
					}))
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'text_format',
					description: 'Do you want to see your gear in plaintext?',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'swap',
			description: 'Swap gear from one setup to another.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'setup_one',
					description: 'The setup you want to switch.',
					required: true,
					choices: GearSetupTypes.map(i => ({ name: toTitleCase(i), value: i }))
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'setup_two',
					description: 'The setup you want to switch.',
					required: true,
					choices: GearSetupTypes.map(i => ({ name: toTitleCase(i), value: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'best_in_slot',
			description: 'View the best in slot items for a particular stat.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'stat',
					description: 'The stat to view the BiS items for.',
					required: true,
					choices: Object.values(GearStat).map(k => ({ name: k, value: k }))
				}
			]
		}
	],
	run: async ({
		options,
		interaction,
		userID
	}: CommandRunOptions<{
		equip?: {
			gear_setup: GearSetupType;
			item?: string;
			items?: string;
			preset?: string;
			quantity?: number;
			auto?: string;
		};
		unequip?: { gear_setup: GearSetupType; item?: string; all?: boolean };
		stats?: { gear_setup: string };
		pet?: { equip?: string; unequip?: string };
		view?: { setup: string; text_format?: boolean };
		swap?: { setup_one: GearSetupType; setup_two: GearSetupType };
		best_in_slot?: { stat: GearStat };
	}>) => {
		const user = await mUserFetch(userID);

		if (options.best_in_slot?.stat) {
			const res = findBestGearSetups(options.best_in_slot.stat);
			const totalCanvas = createCanvas(5 * 175, 240);
			const ctx = totalCanvas.getContext('2d');
			for (let i = 0; i < 5; i++) {
				const gearImage = await generateGearImage(user, res[i], 'melee', null, `${i + 1}`);
				ctx.drawImage(await loadImage(gearImage), i * 175, 0);
			}
			return {
				content: `These are the best in slot items for ${options.best_in_slot.stat}.

${res
	.slice(0, 10)
	.map(
		(setup, idx) =>
			`${idx + 1}. ${setup.toString()} has ${setup.getStats()[options.best_in_slot!.stat]} ${
				options.best_in_slot!.stat
			}`
	)
	.join('\n')}`,
				files: [await canvasToBuffer(totalCanvas)]
			};
		}
		if ((options.equip || options.unequip) && !gearValidationChecks.has(userID)) {
			const { itemsUnequippedAndRefunded } = await user.validateEquippedGear();
			if (itemsUnequippedAndRefunded.length > 0) {
				return `You had some items equipped that you didn't have the requirements to use, so they were unequipped and refunded to your bank: ${itemsUnequippedAndRefunded}`;
			}
		}
		if (options.equip) {
			return gearEquipCommand({
				interaction,
				userID: user.id,
				setup: options.equip.gear_setup,
				item: options.equip.item,
				items: options.equip.items,
				preset: options.equip.preset,
				quantity: options.equip.quantity,
				unEquippedItem: undefined,
				auto: options.equip.auto
			});
		}
		if (options.unequip) {
			return gearUnequipCommand(user, options.unequip.gear_setup, options.unequip.item, options.unequip.all);
		}
		if (options.stats) return gearStatsCommand(user, options.stats.gear_setup);
		if (options.pet?.equip) return equipPet(user, options.pet.equip);
		if (options.pet?.unequip) return unequipPet(user);
		if (options.view) return gearViewCommand(user, options.view.setup, Boolean(options.view.text_format));
		if (options.swap) {
			return gearSwapCommand(interaction, user, options.swap.setup_one, options.swap.setup_two);
		}

		return 'Invalid command.';
	}
};
