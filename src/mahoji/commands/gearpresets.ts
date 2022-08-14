import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { CommandOption } from 'mahoji/dist/lib/types';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { gearPresetToGear, GearSetupType, globalPresets } from '../../lib/gear';
import { generateGearImage } from '../../lib/gear/functions/generateGearImage';
import { prisma } from '../../lib/settings/prisma';
import { cleanString, isValidGearSetup, isValidNickname, stringMatches } from '../../lib/util';
import { getItem } from '../../lib/util/getOSItem';
import { gearEquipCommand } from '../lib/abstracted_commands/gearCommands';
import { allEquippableItems, gearPresetOption, gearSetupOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

function maxPresets(user: KlasaUser) {
	return user.perkTier * 2 + 3;
}

type InputGear = Partial<Record<EquipmentSlot, string | undefined>>;
type ParsedInputGear = Partial<Record<EquipmentSlot, number>>;
function parseInputGear(inputGear: InputGear) {
	let gear: ParsedInputGear = {};
	for (const [key, val] of Object.entries(inputGear)) {
		const item = getItem(val);
		if (item && item.equipment?.slot === key) {
			gear[key as EquipmentSlot] = item.id;
		}
	}
	return gear;
}

async function createOrEditGearSetup(
	user: KlasaUser,
	setupToCopy: GearSetupType | undefined,
	name: string,
	isUpdating: boolean,
	gearInput: InputGear
) {
	name = cleanString(name).toLowerCase();
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

	const parsedInputGear = parseInputGear(gearInput);
	let gearSetup = setupToCopy ? user.rawGear()[setupToCopy] : null;

	const gearData = {
		head: gearSetup?.head?.item ?? parsedInputGear.head ?? null,
		neck: gearSetup?.neck?.item ?? parsedInputGear.neck ?? null,
		body: gearSetup?.body?.item ?? parsedInputGear.body ?? null,
		legs: gearSetup?.legs?.item ?? parsedInputGear.legs ?? null,
		cape: gearSetup?.cape?.item ?? parsedInputGear.cape ?? null,
		two_handed: gearSetup?.['2h']?.item ?? parsedInputGear['2h'] ?? null,
		hands: gearSetup?.hands?.item ?? parsedInputGear.hands ?? null,
		feet: gearSetup?.feet?.item ?? parsedInputGear.feet ?? null,
		shield: gearSetup?.shield?.item ?? parsedInputGear.shield ?? null,
		weapon: gearSetup?.weapon?.item ?? parsedInputGear.weapon ?? null,
		ring: gearSetup?.ring?.item ?? parsedInputGear.ring ?? null,
		ammo: gearSetup?.ammo?.item ?? parsedInputGear.ammo ?? null,
		ammo_qty: gearSetup?.ammo?.quantity ?? null
	};

	const preset = await prisma.gearPreset.upsert({
		where: {
			user_id_name: {
				user_id: user.id,
				name
			}
		},
		update: gearData,
		create: {
			...gearData,
			name,
			user_id: user.id
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
			return (
				value
					? allEquippableItems.filter(i => i.name.toLowerCase().includes(value.toLowerCase()))
					: allEquippableItems
			)
				.filter(i => i.equipment?.slot === slot)
				.slice(0, 20)
				.map(i => ({ name: i.name, value: i.name }));
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
				...Object.values(EquipmentSlot).map(makeSlotOption)
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'edit',
			description: 'Edit an existing gear preset.',
			options: [
				{
					...gearPresetOption,
					name: 'preset',
					required: true
				},
				...Object.values(EquipmentSlot).map(makeSlotOption)
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
		create?: InputGear & { copy_setup?: GearSetupType; name: string };
		edit?: InputGear & { preset: string };
		delete?: { preset: string };
		view?: { preset: string };
	}>) => {
		const klasaUser = await globalClient.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);
		if (options.create) {
			return createOrEditGearSetup(
				klasaUser,
				options.create.copy_setup,
				options.create.name,
				false,
				options.create
			);
		}
		if (options.edit) {
			return createOrEditGearSetup(klasaUser, undefined, options.edit.preset, true, options.edit);
		}
		if (options.delete) {
			const preset = await prisma.gearPreset.findFirst({
				where: { user_id: userID.toString(), name: options.delete.preset }
			});
			if (!preset) {
				return "You don't have a gear preset with that name.";
			}

			await prisma.gearPreset.delete({
				where: {
					user_id_name: {
						user_id: userID.toString(),
						name: options.delete.preset
					}
				}
			});

			return `Successfully deleted your preset called \`${options.delete.preset}\`.`;
		}
		if (options.equip) {
			return gearEquipCommand({
				interaction,
				user: mahojiUser,
				klasaUser,
				setup: options.equip.gear_setup,
				item: undefined,
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
			const image = await generateGearImage(klasaUser, gearPresetToGear(preset), null, null);
			return { attachments: [{ buffer: image, fileName: 'preset.jpg' }] };
		}

		return 'Invalid command.';
	}
};
