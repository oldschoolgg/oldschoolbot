import { ButtonBuilder, ButtonStyle, collectSingleInteraction, SpecialResponse } from '@oldschoolgg/discord';
import { GearSetupTypes, GearStat } from '@oldschoolgg/gear';
import { sleep, Time, toTitleCase } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';
import { chunk } from 'remeda';

import { choicesOf, equippedItemOption, gearPresetOption, gearSetupOption, ownedItemOption } from '@/discord/index.js';
import { canvasToBuffer, createCanvas, loadImage } from '@/lib/canvas/canvasUtil.js';
import { petMetamorphChatMsg } from '@/lib/canvas/petMetamorphChatMsg.js';
import { BOT_TYPE } from '@/lib/constants.js';
import { allPetIDs } from '@/lib/data/CollectionsExport.js';
import { findBestGearSetups } from '@/lib/gear/functions/findBestGearSetups.js';
import { equipPet } from '@/lib/minions/functions/equipPet.js';
import { unequipPet } from '@/lib/minions/functions/unequipPet.js';
import { validateEquippedGear } from '@/lib/user/userUtils.js';
import {
	gearEquipCommand,
	gearStatsCommand,
	gearSwapCommand,
	gearUnequipCommand,
	gearViewCommand
} from '@/mahoji/lib/abstracted_commands/gearCommands.js';
import { petChangeCommand, petMorphAutocomplete } from '@/mahoji/lib/abstracted_commands/petChangeCommand.js';

const gearValidationChecks = new Set();
const PET_CHANGE_RETRY_LIMIT = 10;
const PET_CHANGE_REVEAL_DELAY = 10 * Time.Second;

const petEquipAutocomplete = async ({ value, user }: StringAutoComplete) =>
	[...new Set(allPetIDs)]
		.filter(id => user.bank.has(id))
		.map(id => ({ id, name: Items.itemNameFromId(id) }))
		.filter(item => item.name && (!value || item.name.toLowerCase().includes(value.toLowerCase())))
		.map(item => ({
			name: `${item.name}`,
			value: String(item.id)
		}));

export const gearCommand = defineCommand({
	name: 'gear',
	flags: ['REQUIRES_LOCK'],
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
			type: 'SubcommandGroup',
			name: 'pet',
			description: 'Manage your pet.',
			options: [
				{
					type: 'Subcommand',
					name: 'equip',
					description: 'Equip a pet from your bank.',
					options: [
						{
							type: 'String',
							name: 'pet',
							description: 'The pet to equip.',
							required: true,
							autocomplete: petEquipAutocomplete
						}
					]
				},
				{ type: 'Subcommand', name: 'unequip', description: 'Unequip your pet.' },
				{
					type: 'Subcommand',
					name: 'change',
					description: 'Change your equipped pet’s appearance.',
					options: [
						{
							type: 'String',
							name: 'morph',
							description: 'The appearance to change your pet to.',
							autocomplete: petMorphAutocomplete
						}
					]
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
	run: async ({ options, interaction, user, rng }) => {
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
			`${idx + 1}. ${setup.toString()} has ${setup.getStats()[options.best_in_slot!.stat]} ${
				options.best_in_slot!.stat
			}`
	)
	.join('\n')}`,
				files: [{ buffer: await canvasToBuffer(totalCanvas), name: 'best_in_slot.png' }]
			};
		}
		if ((options.equip || options.unequip) && !gearValidationChecks.has(user.id)) {
			const { itemsUnequippedAndRefunded } = await validateEquippedGear(user);
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
		if (options.pet?.equip) {
			const petId = Number(options.pet.equip.pet);
			if (!Number.isSafeInteger(petId) || petId <= 0) return 'Choose a valid pet from your bank.';
			return equipPet(user, petId);
		}
		if (options.pet?.unequip) return unequipPet(user);
		if (options.pet?.change) {
			const buttonPrefix = `DYN_PET_CHANGE_${interaction.id}_`;
			const originalPetId = user.user.minion_equippedPet;
			let result = await petChangeCommand(user, options.pet.change.morph, rng);
			if (result.choices) {
				const morphButtonId = (value: string) => `${buttonPrefix}MORPH_${value}`;
				const actions = result.choices.map(target => ({ value: String(target.petId), label: target.name }));
				if (result.supportsRandom) actions.push({ value: 'random', label: 'Random unlocked form' });
				if (!actions.length) return result.message;
				await interaction.baseEditReply({
					content: result.message,
					components: chunk(
						actions.map(({ value, label }) =>
							new ButtonBuilder()
								.setCustomId(morphButtonId(value))
								.setLabel(label)
								.setStyle(ButtonStyle.Primary)
						),
						4
					)
				});
				const sent = await interaction.fetchReply();
				const selected = await collectSingleInteraction({
					interaction,
					messageId: sent.id,
					channelId: interaction.channelId,
					users: [user.id],
					timeoutMs: Time.Second * 10,
					filter: button => actions.some(({ value }) => button.customId === morphButtonId(value))
				});
				const action = actions.find(({ value }) => selected?.customId === morphButtonId(value));
				if (!selected || !action) {
					await interaction.baseEditReply({ components: [] });
					return SpecialResponse.RespondedManually;
				}
				await selected.silentButtonAck();
				await user.sync();
				if (user.user.minion_equippedPet !== originalPetId) {
					await interaction.baseEditReply({
						content: 'Your equipped pet changed. Run the command again.',
						components: []
					});
					return SpecialResponse.RespondedManually;
				}
				result = await petChangeCommand(user, action.value, rng);
				if (!result.petId) {
					await interaction.baseEditReply({ content: result.message, components: [] });
					return SpecialResponse.RespondedManually;
				}
			}
			if (!result.petId) return result.message;
			const congratulation = async () => {
				const text = [
					`Love your new pet! Take good care of them.`,
					`Your new friend is lucky to have you. Appreciate them!`,
					`Give your new pet all the love they deserve!`
				][Math.floor(Math.random() * 3)]!;
				const files = [
					{
						name: 'new_pet.png',
						buffer: await petMetamorphChatMsg({ content: text, petId: user.user.minion_equippedPet! })
					}
				];
				await interaction.baseEditReply({ files, components: [] });
			};
			if (result.changed || result.rare) {
				await interaction.baseEditReply({
					content: result.message,
					files: [
						{
							name: 'new_pet.png',
							buffer: await petMetamorphChatMsg({
								content: 'Your new friend is lucky to have you. Love and care for them!',
								petId: result.petId
							})
						}
					],
					components: []
				});
				return result.changed ? SpecialResponse.RespondedManually : 'Your pet’s new appearance is ready!';
			}
			const tryAgainId = `${buttonPrefix}TRY_AGAIN`;
			const thanksId = `${buttonPrefix}THANKS`;
			const components = [
				new ButtonBuilder().setCustomId(tryAgainId).setLabel('Try again').setStyle(ButtonStyle.Primary),
				new ButtonBuilder().setCustomId(thanksId).setLabel('Thanks!').setStyle(ButtonStyle.Secondary)
			];
			const disabledComponents = components.map(button => new ButtonBuilder(button.toJSON()).setDisabled(true));
			await interaction.baseEditReply({
				content: result.message,
				components
			});
			const sent = await interaction.fetchReply();
			let attempts = 0;
			while (attempts < PET_CHANGE_RETRY_LIMIT) {
				const selected = await collectSingleInteraction({
					interaction,
					messageId: sent.id,
					channelId: interaction.channelId,
					users: [user.id],
					timeoutMs: Time.Second * 10,
					filter: button => button.customId === tryAgainId || button.customId === thanksId
				});
				if (!selected) break;
				if (selected.customId === thanksId) {
					await selected.silentButtonAck();
					await congratulation();
					return 'Your pet’s new appearance is ready!';
				}
				await selected.update({ content: 'Trying up to ten times....', components: disabledComponents });
				attempts++;
				await sleep(PET_CHANGE_REVEAL_DELAY);
				const next = await petChangeCommand(user, 'random', rng, 10);
				if (!next.petId) {
					await interaction.baseEditReply({ content: next.message, components: [] });
					return SpecialResponse.RespondedManually;
				}
				if (next.rare) {
					await interaction.baseEditReply({
						content: next.message,
						files: [
							{
								name: 'new_pet.png',
								buffer: await petMetamorphChatMsg({
									content: 'Your new friend is lucky to have you. Love and care for them!',
									petId: next.petId
								})
							}
						],
						components: []
					});
					return SpecialResponse.RespondedManually;
				}
				result = next;
				if (attempts < PET_CHANGE_RETRY_LIMIT)
					await interaction.baseEditReply({ content: result.message, components });
			}
			if (attempts >= PET_CHANGE_RETRY_LIMIT) {
				await interaction.baseEditReply({
					content: `${result.message}\n\nStart a new command to try again 😃`,
					components: []
				});
				return SpecialResponse.RespondedManually;
			}
			await congratulation();
			return SpecialResponse.RespondedManually;
		}
		if (options.view) return gearViewCommand(user, options.view.setup, Boolean(options.view.text_format));
		if (options.swap) {
			return gearSwapCommand(interaction, user, options.swap.setup_one, options.swap.setup_two);
		}

		return 'Invalid command.';
	}
});
