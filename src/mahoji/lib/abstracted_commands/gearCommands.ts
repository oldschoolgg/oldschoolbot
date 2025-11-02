import { PerkTier, stringMatches, toTitleCase } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';
import type { GearStat } from 'oldschooljs/gear';

import type { GearPreset } from '@/prisma/main.js';
import { generateGearImage } from '@/lib/canvas/generateGearImage.js';
import { PATRON_ONLY_GEAR_SETUP } from '@/lib/constants.js';
import { getSimilarItems } from '@/lib/data/similarItems.js';
import { isValidGearSetup, isValidGearStat } from '@/lib/gear/functions/isValidGearSetup.js';
import type { GearSetup, GearSetupType } from '@/lib/gear/types.js';
import getUserBestGearFromBank from '@/lib/minions/functions/getUserBestGearFromBank.js';
import { unEquipAllCommand } from '@/lib/minions/functions/unequipAllCommand.js';
import { defaultGear, Gear, globalPresets } from '@/lib/structures/Gear.js';
import calculateGearLostOnDeathWilderness from '@/lib/util/calculateGearLostOnDeathWilderness.js';
import { gearEquipMultiImpl } from '@/lib/util/equipMulti.js';
import { assert } from '@/lib/util/logError.js';
import { formatSkillRequirements } from '@/lib/util/smallUtils.js';

async function gearPresetEquipCommand(user: MUser, gearSetup: string, presetName: string): CommandResponse {
	if (user.minionIsBusy) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}

	if (!presetName) return "You didn't supply a preset name.";
	if (!gearSetup) return "You didn't supply a setup.";

	if (!isValidGearSetup(gearSetup)) {
		return "That's not a valid gear setup.";
	}

	const userPreset = await prisma.gearPreset.findFirst({ where: { user_id: user.id, name: presetName } });
	const globalPreset = globalPresets.find(i => i.name === presetName);
	if (!userPreset && !globalPreset) {
		return "You don't have a gear preset with that name.";
	}
	const preset = (userPreset ?? globalPreset) as GearPreset;
	if (preset.two_handed !== null) {
		preset.weapon = null;
		preset.shield = null;
	}

	// Checks the preset to make sure the user has the required stats for every item in the preset
	for (const gearItemId of Object.values(preset)) {
		if (gearItemId !== null) {
			const itemToEquip = Items.getItem(gearItemId);
			if (itemToEquip?.equipment?.requirements && !user.hasSkillReqs(itemToEquip.equipment.requirements)) {
				return `You can't equip this preset because ${
					itemToEquip.name
				} requires these stats: ${formatSkillRequirements(itemToEquip.equipment.requirements)}.`;
			}
		}
	}

	const userBankWithEquippedItems = user.bank.clone();
	for (const e of Object.values(user.gear[gearSetup].raw())) {
		if (e) userBankWithEquippedItems.add(e.item, Math.max(e.quantity, 1));
	}

	const toRemove = new Bank();
	function gearItem(piece: null | number) {
		if (piece === null) return null;
		if (!userBankWithEquippedItems.has(piece) && globalPreset) {
			for (const similarPiece of getSimilarItems(piece)) {
				if (userBankWithEquippedItems.has(similarPiece)) {
					piece = similarPiece;
					break;
				}
			}
		}
		toRemove.add(piece);
		return {
			item: piece,
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

	if (preset.ammo) {
		newGear.ammo = { item: preset.ammo, quantity: preset.ammo_qty! };
		toRemove.add(preset.ammo, preset.ammo_qty!);
	}

	if (!userBankWithEquippedItems.has(toRemove)) {
		return `You don't have the items in this preset. You're missing: ${toRemove.remove(user.bank)}.`;
	}

	await unEquipAllCommand(user, gearSetup);

	await user.transactItems({
		itemsToRemove: toRemove,
		otherUpdates: {
			[`gear_${gearSetup}`]: newGear
		}
	});

	if (userPreset && !globalPreset) {
		await prisma.gearPreset.update({
			where: {
				user_id_name: {
					user_id: user.id,
					name: userPreset.name
				}
			},
			data: {
				times_equipped: {
					increment: 1
				}
			}
		});
	}
	const image = await user.generateGearImage({ setupType: gearSetup });

	return {
		content: `You equipped the ${preset.name} preset in your ${gearSetup} setup.`,
		files: [{ name: 'gear.png', buffer: image }]
	};
}

async function gearEquipMultiCommand(user: MUser, setup: string, items: string) {
	if (!isValidGearSetup(setup)) return 'Invalid gear setup.';

	// We must update the user after any confirmation because the bank/gear could change from something else.
	await user.sync();
	const {
		success: resultSuccess,
		failMsg,
		skillFailBank,
		equippedGear,
		equipBank,
		unequipBank
	} = gearEquipMultiImpl(user, setup, items);
	if (!resultSuccess) return failMsg!;

	const dbKey = `gear_${setup}` as const;

	await user.transactItems({
		filterLoot: false,
		itemsToRemove: equipBank,
		itemsToAdd: unequipBank,
		otherUpdates: {
			[dbKey]: equippedGear
		}
	});

	const image = await user.generateGearImage({ setupType: setup });
	let content = `You equipped ${equipBank} on your ${setup} setup, and unequipped ${unequipBank}.`;
	if (skillFailBank!.length > 0) {
		content += `\nThese items failed to be equipped as you don't have the requirements: ${skillFailBank}.`;
	}

	if (setup === 'wildy') {
		content +=
			"\n\nYou're trying to equip items into your *wildy* setup. ANY item in this setup can potentially be lost if doing Wilderness activities. Please confirm you understand this.";
	}

	return {
		content,
		files: [{ name: 'gear.png', buffer: image }]
	};
}

export async function gearEquipCommand(args: {
	interaction: MInteraction;
	user: MUser;
	setup: string;
	item: string | undefined;
	items: string | undefined;
	preset: string | undefined;
	quantity: number | undefined;
	unEquippedItem: Bank | undefined;
	auto: string | undefined;
}): CommandResponse {
	const { user, setup, item, items, preset, quantity, auto } = args;
	if (!isValidGearSetup(setup)) return 'Invalid gear setup.';
	if (user.minionIsBusy) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}

	if (items) {
		return gearEquipMultiCommand(user, setup, items);
	}
	if (setup === 'other' && (await user.fetchPerkTier()) < PerkTier.Four) {
		return PATRON_ONLY_GEAR_SETUP;
	}
	if (preset) {
		return gearPresetEquipCommand(user, setup, preset);
	}
	if (auto) {
		return autoEquipCommand(user, setup, auto);
	}

	if (!item) {
		return 'You need to specify an item to equip.';
	}

	// They are trying to equip 1 item
	return gearEquipMultiCommand(user, setup, `${quantity ? quantity : 1} ${item}`);
}

export async function gearUnequipCommand(
	user: MUser,
	gearSetup: string,
	itemToUnequip: string | undefined,
	unequipAll: boolean | undefined
): CommandResponse {
	if (user.minionIsBusy) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}
	if (!isValidGearSetup(gearSetup)) return "That's not a valid gear setup.";
	if (unequipAll) {
		return unEquipAllCommand(user, gearSetup);
	}

	const currentEquippedGear = user.gear[gearSetup];
	const currentGear = currentEquippedGear.raw();

	const item = Items.getItem(itemToUnequip);
	if (!item) return "That's not a valid item.";
	if (!currentEquippedGear.hasEquipped(item.id, true, false))
		return `You don't have that equipped in your ${gearSetup} setup.`;
	if (!itemToUnequip) {
		return "You don't have this item equipped!";
	}

	const { slot } = item.equipment!;
	const equippedInThisSlot = currentGear[slot];
	assert(equippedInThisSlot !== null, `equippedInThisSlot should not be null: ${gearSetup} ${item.name}`, {
		user_id: user.id
	});
	const newGear = { ...currentGear };
	newGear[slot] = null;

	const itemsToAdd = new Bank().add(equippedInThisSlot!.item, equippedInThisSlot!.quantity);
	await user.transactItems({
		itemsToAdd,
		collectionLog: false,
		otherUpdates: {
			[`gear_${gearSetup}`]: newGear
		}
	});

	const image = await user.generateGearImage({ setupType: gearSetup });

	return {
		content: `You unequipped ${item.name} from your ${toTitleCase(gearSetup)} setup.`,
		files: [{ name: 'gear.png', buffer: image }]
	};
}

async function autoEquipCommand(user: MUser, gearSetup: GearSetupType, equipmentType: string): CommandResponse {
	if (gearSetup === 'other' && (await user.fetchPerkTier()) < PerkTier.Four) {
		return PATRON_ONLY_GEAR_SETUP;
	}

	if (!isValidGearStat(equipmentType)) {
		return 'Invalid gear stat.';
	}

	const { gearToEquip, toRemoveFromBank, toRemoveFromGear } = getUserBestGearFromBank({
		gearBank: user.gearBank,
		gearStat: equipmentType as GearStat,
		gearSetup,
		extra: null
	});

	if (toRemoveFromBank.length === 0) {
		return "Couldn't find anything to equip.";
	}

	if (!user.owns(toRemoveFromBank)) {
		return `You dont own ${toRemoveFromBank}!`;
	}

	await user.transactItems({
		itemsToRemove: toRemoveFromBank,
		itemsToAdd: toRemoveFromGear,
		otherUpdates: {
			[`gear_${gearSetup}`]: gearToEquip
		}
	});

	const image = await user.generateGearImage({ setupType: gearSetup });
	return {
		content: `You auto-equipped your best ${equipmentType} in your ${gearSetup} preset.`,
		files: [{ name: 'gear.png', buffer: image }]
	};
}

export async function gearStatsCommand(user: MUser, input: string): CommandResponse {
	const gear = { ...defaultGear };
	for (const name of input.split(',')) {
		const item = Items.getItem(name);
		if (item?.equipment) {
			gear[item.equipment.slot] = { item: item.id, quantity: 1 };
		}
	}
	const image = await user.generateGearImage({ gearSetup: new Gear(gear) });
	return { files: [{ name: 'image.png', buffer: image }] };
}

export async function gearViewCommand(user: MUser, input: string, text: boolean): CommandResponse {
	if (stringMatches(input, 'all')) {
		const file = text
			? {
					buffer: Buffer.from(
						Object.entries(user.gear)
							.map(i => `${i[0]}: ${i[1].toString()}`)
							.join('\n')
					),
					name: 'gear.txt'
				}
			: { buffer: await user.generateGearImage({ setupType: 'all' }), name: 'osbot.png' };
		return {
			content: 'Here are all your gear setups',
			files: [file]
		};
	}
	if (stringMatches(input, 'lost on wildy death')) {
		interface GearLostOptions {
			gear: GearSetup;
			skulled: boolean;
			after20wilderness: boolean;
			smited: boolean;
			protectItem: boolean;
		}

		function showGearLost(options: GearLostOptions) {
			const results = calculateGearLostOnDeathWilderness(options);
			return results; // Return the entire results object
		}

		function calculateAndGetString(options: GearLostOptions, smited: boolean): string {
			const gearLost = showGearLost({ ...options, smited });
			return gearLost.lostItems.toString();
		}

		const userGear = user.gear.wildy;
		const scenarios = [
			{ skulled: true, after20wilderness: true, smited: false, protectItem: true },
			{ skulled: true, after20wilderness: true, smited: true, protectItem: true },
			{ skulled: false, after20wilderness: true, smited: true, protectItem: true },
			{ skulled: false, after20wilderness: true, smited: false, protectItem: true },
			{ skulled: false, after20wilderness: false, smited: true, protectItem: true },
			{ skulled: false, after20wilderness: false, smited: false, protectItem: true }
		];

		const scenarioDescriptions = [
			'when skulled',
			'when skulled and smited',
			'in 20+ Wilderness and smited',
			'in 20+ Wilderness',
			'in less than 20 Wilderness and smited',
			'in less than 20 Wilderness'
		];

		const content = scenarios
			.map((scenario, index) => {
				const lostItemsString = calculateAndGetString({ gear: userGear, ...scenario }, scenario.smited);
				const description = scenarioDescriptions[index];
				return `The gear you would lose ${description}:\n${lostItemsString}`;
			})
			.join('\n\n');

		const updatedContent = `${content}\n\nThese assume you have at least 25 prayer for the protect item prayer.`;

		return { content: updatedContent };
	}
	if (!isValidGearSetup(input)) return 'Invalid setup.';
	const gear = user.gear[input];
	if (text) {
		return gear.toString();
	}
	const image = await generateGearImage({ gearSetup: gear, gearType: input, petID: user.user.minion_equippedPet });
	return { files: [{ buffer: image, name: 'gear.png' }] };
}

export async function gearSwapCommand(
	interaction: MInteraction,
	user: MUser,
	first: GearSetupType,
	second: GearSetupType
) {
	if (!first || !second || first === second || !isValidGearSetup(first) || !isValidGearSetup(second)) {
		return 'Invalid gear setups. You must provide two unique gear setups to switch gear between.';
	}
	if (first === 'wildy' || second === 'wildy') {
		await interaction.confirmation(
			'Are you sure you want to swap your gear with a wilderness setup? You can lose items on your wilderness setup!'
		);
	}

	if ([first, second].includes('other') && (await user.fetchPerkTier()) < PerkTier.Four) {
		return PATRON_ONLY_GEAR_SETUP;
	}

	return user.update(current => {
		const { gear } = current;

		return {
			response: `You swapped your ${first} gear with your ${second} gear.`,
			otherUpdates: {
				[`gear_${first}`]: gear[second],
				[`gear_${second}`]: gear[first]
			}
		};
	});
}
