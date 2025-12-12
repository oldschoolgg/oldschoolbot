import { Items } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

import { choicesOf, equippedItemOption, gearPresetOption, gearSetupOption, ownedItemOption } from '@/discord/index.js';
import { canvasToBuffer, createCanvas, loadImage } from '@/lib/canvas/canvasUtil.js';
import { BOT_TYPE } from '@/lib/constants.js';
import { allPetIDs } from '@/lib/data/CollectionsExport.js';
import { findBestGearSetups } from '@/lib/gear/functions/findBestGearSetups.js';
import { GearSetupTypes } from '@/lib/gear/types.js';
import { equipPet } from '@/lib/minions/functions/equipPet.js';
import { unequipPet } from '@/lib/minions/functions/unequipPet.js';
import {
	gearEquipCommand,
	gearStatsCommand,
	gearSwapCommand,
	gearUnequipCommand,
	gearViewCommand
} from '@/mahoji/lib/abstracted_commands/gearCommands.js';

const gearValidationChecks = new Set();

export const gearCommand = defineCommand({
	name: 'gear',
	description: 'Manage, equip, unequip your gear.',
	options: [
		{
			type: 'Subcommand',
			name: 'equip',
			description: 'Equip an item or preset to one of your gear setups.',
			options: [
				{
					...gearSetupOption,
					required: true
				},
				{
					type: 'String',
					name: 'items',
					description: 'A list of equippable items to equip.'
				},
				{
					...ownedItemOption(item => Boolean(item.equipable) && Boolean(item.equipment)),
					name: 'item',
					description: 'The item you want to equip.'
				},
				{
					...gearPresetOption,
					required: false,
					name: 'preset'
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity you want to equip (optional).',
					required: false,
					min_value: 1
				},
				{
					type: 'String',
					name: 'auto',
					description: 'Automatically equip the best gear you have for a certain style.',
					required: false,
					choices: choicesOf(Object.values(GearStat))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'unequip',
			description: 'Unequip an item from one of your gear setups.',
			options: [
				{
					...gearSetupOption,
					required: true
				},
				{
					...equippedItemOption,
					name: 'item',
					description: 'The item you want to unequip.',
					required: false
				},
				{
					type: 'Boolean',
					name: 'all',
					description: 'Unequip everything in this setup?',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'stats',
			description: 'Check the gear stats of a list of items, regardless if you own them or not.',
			options: [
				{
					type: 'String',
					name: 'gear_setup',
					description: 'A list of equippable items to check the stats of.',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'pet',
			description: 'Equip or unequip a pet.',
			options: [
				{
					type: 'String',
					name: 'equip',
					description: 'Equip a pet.',
					required: false,
					autocomplete: async ({ value, user }: StringAutoComplete) => {
						return allPetIDs
							.filter(i => user.bank.has(i))
							.map(i => Items.itemNameFromId(i)!)
							.filter(i => (!value ? true : i.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i, value: i }));
					}
				},
				{
					type: 'Boolean',
					name: 'unequip',
					description: 'Unequip your pet.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'view',
			description: 'View your gear.',
			options: [
				{
					type: 'String',
					name: 'setup',
					description: 'The setup you want to view.',
					required: true,
					choices: ['All', ...GearSetupTypes, 'Lost on wildy death'].map(i => ({
						name: toTitleCase(i),
						value: i
					}))
				},
				{
					type: 'Boolean',
					name: 'text_format',
					description: 'Do you want to see your gear in plaintext?',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'swap',
			description: 'Swap gear from one setup to another.',
			options: [
				{
					type: 'String',
					name: 'setup_one',
					description: 'The setup you want to switch.',
					required: true,
					choices: choicesOf(GearSetupTypes)
				},
				{
					type: 'String',
					name: 'setup_two',
					description: 'The setup you want to switch.',
					required: true,
					choices: choicesOf(GearSetupTypes)
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'best_in_slot',
			description: 'View the best in slot items for a particular stat.',
			options: [
				{
					type: 'String',
					name: 'stat',
					description: 'The stat to view the BiS items for.',
					required: true,
					choices: choicesOf(Object.values(GearStat))
				}
			]
		}
	],
	run: async ({ options, interaction, user }) => {
		await interaction.defer();
		if (options.best_in_slot?.stat) {
			const res = findBestGearSetups({ stat: options.best_in_slot.stat, ignoreUnobtainable: BOT_TYPE === 'OSB' });
			const totalCanvas = createCanvas(900, 480 * 5);
			const ctx = totalCanvas.getContext('2d');
			for (let i = 0; i < 5; i++) {
				const gearImageBuffer = await user.generateGearImage({ gearSetup: res[i] });
				const gearImage = await loadImage(gearImageBuffer);
				ctx.drawImage(gearImage, 0, i * gearImage.height);
			}
			return {
				content: `These are the best in slot items for ${options.best_in_slot.stat}.

${res
						.slice(0, 10)
						.map(
							(setup, idx) =>
								`${idx + 1}. ${setup.toString()} has ${setup.getStats()[options.best_in_slot!.stat]} ${options.best_in_slot!.stat
								}`
						)
						.join('\n')}`,
				files: [{ buffer: await canvasToBuffer(totalCanvas), name: 'best_in_slot.png' }]
			};
		}
		if ((options.equip || options.unequip) && !gearValidationChecks.has(user.id)) {
			const { itemsUnequippedAndRefunded } = await user.validateEquippedGear();
			if (itemsUnequippedAndRefunded.length > 0) {
				return `You had some items equipped that you didn't have the requirements to use, so they were unequipped and refunded to your bank: ${itemsUnequippedAndRefunded}`;
			}
		}
		if (options.equip) {
			return gearEquipCommand({
				interaction,
				user,
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
});
