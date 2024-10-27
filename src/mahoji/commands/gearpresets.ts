import { type CommandOption, type CommandRunOptions, cleanString, stringMatches } from '@oldschoolgg/toolkit/util';
import type { GearPreset } from '@prisma/client';
import { ApplicationCommandOptionType } from 'discord.js';

import { production } from '../../config';
import { ParsedCustomEmojiWithGroups } from '../../lib/constants';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import type { GearSetup, GearSetupType } from '../../lib/gear/types';
import { GearSetupTypes } from '../../lib/gear/types';

import { Gear, defaultGear, globalPresets } from '../../lib/structures/Gear';
import { EquipmentSlot, isValidGearSetup, isValidNickname } from '../../lib/util';
import { emojiServers } from '../../lib/util/cachedUserIDs';
import { getItem } from '../../lib/util/getOSItem';
import { gearEquipCommand } from '../lib/abstracted_commands/gearCommands';
import { allEquippableItems, gearPresetOption, gearSetupOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';

function maxPresets(user: MUser) {
	return user.perkTier() * 2 + 4;
}

type InputGear = Partial<Record<EquipmentSlot, string | undefined>>;
type ParsedInputGear = Partial<Record<EquipmentSlot, number>>;
function parseInputGear(inputGear: InputGear) {
	const gear: ParsedInputGear = {};
	const remove: EquipmentSlot[] = [];
	for (const [key, val] of Object.entries(inputGear)) {
		if (val?.toLowerCase() === 'none') {
			remove.push(key as EquipmentSlot);
			continue;
		}
		const item = getItem(val);
		if (item && item.equipment?.slot === key) {
			gear[key as EquipmentSlot] = item.id;
		}
	}
	return { gear, remove };
}

function gearPresetToGear(preset: GearPreset): GearSetup {
	function gearItem(val: null | number) {
		if (val === null) return null;
		return {
			item: val,
			quantity: 1
		};
	}
	const newGear = { ...defaultGear };
	newGear.head = gearItem(preset.head);
	newGear.neck = gearItem(preset.neck);
	newGear.body = gearItem(preset.body);
	newGear.legs = gearItem(preset.legs);
	newGear.cape = gearItem(preset.cape);
	newGear['2h'] = gearItem(preset.two_handed);
	newGear.hands = gearItem(preset.hands);
	newGear.feet = gearItem(preset.feet);
	newGear.shield = gearItem(preset.shield);
	newGear.weapon = gearItem(preset.weapon);
	newGear.ring = gearItem(preset.ring);
	newGear.ammo = preset.ammo
		? {
				item: preset.ammo,
				quantity: 1
			}
		: null;
	return newGear;
}
export async function createOrEditGearSetup(
	user: MUser,
	setupToCopy: GearSetupType | undefined,
	name: string,
	isUpdating: boolean,
	gearInput: InputGear,
	emoji: string | undefined,
	pinned_setup: GearSetupType | 'reset' | undefined
) {
	if (name) {
		name = cleanString(name).toLowerCase();
	}
	if (name.length > 24) return 'Gear preset names must be less than 25 characters long.';
	if (!name) return "You didn't supply a name.";
	if (!isUpdating && !isValidNickname(name)) {
		return 'Invalid name.';
	}

	if (setupToCopy && !isValidGearSetup(setupToCopy)) {
		return "That's not a valid gear setup.";
	}

	const userPresets = await prisma.gearPreset.findMany({ where: { user_id: user.id } });
	if (userPresets.some(pre => pre.name === name) && !isUpdating) {
		return `You already have a gear preset called \`${name}\`.`;
	}
	if (!userPresets.some(pre => pre.name === name) && isUpdating) {
		return 'You cant update a gearpreset you dont have.';
	}

	const max = maxPresets(user);
	if (userPresets.length >= max && !isUpdating) {
		return `The maximum amount of gear presets you can have is ${max}, you can unlock more slots by becoming a patron!`;
	}

	const { gear: parsedInputGear, remove: forceRemove } = parseInputGear(gearInput);
	let gearSetup: Gear | GearSetup | null = null;
	if (setupToCopy) {
		gearSetup = user.gear[setupToCopy];
	} else if (isUpdating) {
		gearSetup = gearPresetToGear(userPresets.find(pre => pre.name === name)!);
	}

	// This is required to enable removal of items while editing
	for (const slot of forceRemove) {
		if (gearSetup !== null) gearSetup[slot] = null;
	}

	if (emoji) {
		const res = ParsedCustomEmojiWithGroups.exec(emoji);
		if (!res || !res[3]) return "That's not a valid emoji.";
		emoji = res[3];

		const cachedEmoji = globalClient.emojis.cache.get(emoji);
		if ((!cachedEmoji || !emojiServers.has(cachedEmoji.guild.id)) && production) {
			return "Sorry, that emoji can't be used. Only emojis in the main support server, or our emoji servers can be used.";
		}
	}

	const gearData = {
		head: parsedInputGear.head ?? gearSetup?.head?.item ?? null,
		neck: parsedInputGear.neck ?? gearSetup?.neck?.item ?? null,
		body: parsedInputGear.body ?? gearSetup?.body?.item ?? null,
		legs: parsedInputGear.legs ?? gearSetup?.legs?.item ?? null,
		cape: parsedInputGear.cape ?? gearSetup?.cape?.item ?? null,
		two_handed: parsedInputGear['2h'] ?? gearSetup?.['2h']?.item ?? null,
		hands: parsedInputGear.hands ?? gearSetup?.hands?.item ?? null,
		feet: parsedInputGear.feet ?? gearSetup?.feet?.item ?? null,
		shield: parsedInputGear.shield ?? gearSetup?.shield?.item ?? null,
		weapon: parsedInputGear.weapon ?? gearSetup?.weapon?.item ?? null,
		ring: parsedInputGear.ring ?? gearSetup?.ring?.item ?? null,
		ammo: parsedInputGear.ammo ?? gearSetup?.ammo?.item ?? null,
		ammo_qty: gearSetup?.ammo?.quantity ?? null,
		emoji_id: emoji ?? undefined,
		pinned_setup: !pinned_setup || pinned_setup === 'reset' ? undefined : pinned_setup
	};

	if (gearData.two_handed !== null) {
		gearData.shield = null;
		gearData.weapon = null;
	}

	const preset = await prisma.gearPreset.upsert({
		where: {
			user_id_name: {
				user_id: user.id,
				name
			}
		},
		update: {
			...gearData,
			times_equipped: {
				increment: 1
			}
		},
		create: {
			...gearData,
			name,
			user_id: user.id,
			times_equipped: 1
		}
	});

	return `Successfully ${isUpdating ? 'updated the' : 'made a new'} preset called \`${preset.name}\`.`;
}

function makeSlotOption(slot: EquipmentSlot): CommandOption {
	return {
		type: ApplicationCommandOptionType.String,
		name: slot,
		description: `The item you want to put in the ${slot} slot in this gear setup.`,
		required: false,
		autocomplete: async (value: string) => {
			const matchingItems = (
				value
					? allEquippableItems.filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
					: allEquippableItems
			)
				.filter(i => i.equipment?.slot === slot)
				.slice(0, 20)
				.map(i => ({ name: i.name, value: i.name }));
			if (!value || 'none'.includes(value.toLowerCase())) {
				matchingItems.unshift({ name: 'None', value: 'none' });
				if (matchingItems.length > 20) matchingItems.pop();
			}
			return matchingItems;
		}
	};
}

export const gearPresetsCommand: OSBMahojiCommand = {
	name: 'gearpresets',
	description: 'Manage, equip, unequip your gear presets.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View your gear setups.',
			options: [
				{
					...gearPresetOption,
					name: 'preset',
					required: true
				}
			]
		},
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
					...gearPresetOption,
					name: 'preset',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'create',
			description: 'Create a new gear preset.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					required: true,
					description: 'The name to give this preset.'
				},
				{
					...gearSetupOption,
					required: false,
					name: 'copy_setup',
					description: 'Pick a setup to copy/use for this preset.'
				},
				...Object.values(EquipmentSlot).map(makeSlotOption),
				{
					type: ApplicationCommandOptionType.String,
					required: false,
					name: 'emoji',
					description: 'Pick an emoji for the preset.'
				},
				{
					type: ApplicationCommandOptionType.String,
					required: false,
					name: 'pinned_setup',
					description: 'Pick a setup to pin this setup too.',
					choices: GearSetupTypes.map(i => ({ value: i, name: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'edit',
			description: 'Edit an existing gear preset.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'gear_preset',
					description: 'The gear preset you want to select.',
					required: true,
					autocomplete: async (value, user) => {
						const presets = await prisma.gearPreset.findMany({
							where: {
								user_id: user.id
							},
							select: {
								name: true
							}
						});
						return presets
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				...Object.values(EquipmentSlot).map(makeSlotOption),
				{
					type: ApplicationCommandOptionType.String,
					required: false,
					name: 'emoji',
					description: 'Pick an emoji for the preset.'
				},
				{
					type: ApplicationCommandOptionType.String,
					required: false,
					name: 'pinned_setup',
					description: 'Pick a setup to pin this setup too.',
					choices: [...GearSetupTypes, 'reset'].map(i => ({ value: i, name: i }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'delete',
			description: 'Delete an existing gear preset.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'preset',
					description: 'The gear preset you want to delete.',
					required: false,
					autocomplete: async (value, user) => {
						const presets = await prisma.gearPreset.findMany({
							where: {
								user_id: user.id
							},
							select: {
								name: true
							}
						});
						return presets
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
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
		equip?: { gear_setup: GearSetupType; preset: string };
		create?: InputGear & { copy_setup?: GearSetupType; name: string; emoji?: string; pinned_setup?: GearSetupType };
		edit?: InputGear & { gear_preset: string; emoji?: string; pinned_setup?: GearSetupType };
		delete?: { preset: string };
		view?: { preset: string };
	}>) => {
		const user = await mUserFetch(userID);
		if (options.create) {
			return createOrEditGearSetup(
				user,
				options.create.copy_setup,
				options.create.name,
				false,
				options.create,
				options.create.emoji,
				options.create.pinned_setup
			);
		}
		if (options.edit) {
			return createOrEditGearSetup(
				user,
				undefined,
				options.edit.gear_preset,
				true,
				options.edit,
				options.edit.emoji,
				options.edit.pinned_setup
			);
		}
		if (options.delete) {
			const preset = await prisma.gearPreset.findFirst({
				where: { user_id: userID, name: options.delete.preset }
			});
			if (!preset) {
				return "You don't have a gear preset with that name.";
			}

			await prisma.gearPreset.delete({
				where: {
					user_id_name: {
						user_id: userID,
						name: preset.name
					}
				}
			});

			return `Successfully deleted your preset called \`${options.delete.preset}\`.`;
		}
		if (options.equip) {
			return gearEquipCommand({
				interaction,
				userID: user.id,
				setup: options.equip.gear_setup,
				item: undefined,
				items: undefined,
				preset: options.equip.preset,
				quantity: undefined,
				unEquippedItem: undefined,
				auto: undefined
			});
		}
		if (options.view) {
			const preset =
				(await prisma.gearPreset.findFirst({
					where: { user_id: userID.toString(), name: options.view.preset }
				})) || globalPresets.find(i => stringMatches(i.name, options.view?.preset ?? ''));
			if (!preset) return "You don't have a preset with that name.";
			const image = await generateGearImage(user, new Gear(preset), null, null);
			return { files: [{ attachment: image, name: 'preset.jpg' }] };
		}

		return 'Invalid command.';
	}
};
