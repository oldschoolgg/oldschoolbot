import { PerkTier, toTitleCase } from '@oldschoolgg/toolkit/util';
import type { CommandResponse } from '@oldschoolgg/toolkit/util';
import type { GearPreset } from '@prisma/client';
import type { ChatInputCommandInteraction } from 'discord.js';
import { objectValues } from 'e';
import { Bank } from 'oldschooljs';

import { MAX_INT_JAVA, PATRON_ONLY_GEAR_SETUP } from '../../../lib/constants';
import { generateAllGearImage, generateGearImage } from '../../../lib/gear/functions/generateGearImage';
import type { GearSetup, GearSetupType } from '../../../lib/gear/types';
import { GearStat } from '../../../lib/gear/types';
import getUserBestGearFromBank from '../../../lib/minions/functions/getUserBestGearFromBank';
import { unEquipAllCommand } from '../../../lib/minions/functions/unequipAllCommand';

import { Gear, defaultGear, globalPresets } from '../../../lib/structures/Gear';
import { assert, formatSkillRequirements, isValidGearSetup, stringMatches } from '../../../lib/util';
import calculateGearLostOnDeathWilderness from '../../../lib/util/calculateGearLostOnDeathWilderness';
import { gearEquipMultiImpl } from '../../../lib/util/equipMulti';
import { getItem } from '../../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { mahojiParseNumber } from '../../mahojiSettings';

import { getSimilarItems } from '../../../lib/data/similarItems';

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
			const itemToEquip = getItem(gearItemId);
			if (itemToEquip?.equipment?.requirements && !user.hasSkillReqs(itemToEquip.equipment.requirements)) {
				return `You can't equip this preset because ${
					itemToEquip.name
				} requires these stats: ${formatSkillRequirements(itemToEquip.equipment.requirements)}.`;
			}
		}
	}

	const userBankWithEquippedItems = user.bank.clone();
	for (const e of objectValues(user.gear[gearSetup].raw())) {
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

	await unEquipAllCommand(user.id, gearSetup);

	await user.removeItemsFromBank(toRemove);

	await user.update({
		[`gear_${gearSetup}`]: newGear
	});
	const updatedGear = user.gear[gearSetup];
	const image = await generateGearImage(user, updatedGear, gearSetup, user.user.minion_equippedPet);

	return {
		content: `You equipped the ${preset.name} preset in your ${gearSetup} setup.`,
		files: [{ name: 'gear.jpg', attachment: image }]
	};
}

async function gearEquipMultiCommand(
	user: MUser,
	interaction: ChatInputCommandInteraction,
	setup: string,
	items: string
) {
	if (!isValidGearSetup(setup)) return 'Invalid gear setup.';
	if (setup === 'wildy') {
		await handleMahojiConfirmation(
			interaction,
			"You're trying to equip items into your *wildy* setup. ANY item in this setup can potentially be lost if doing Wilderness activities. Please confirm you understand this."
		);
	}

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
	const { newUser } = await user.update({
		[dbKey]: equippedGear
	});
	await transactItems({
		userID: user.id,
		filterLoot: false,
		itemsToRemove: equipBank,
		itemsToAdd: unequipBank
	});

	const image = await generateGearImage(user, newUser[dbKey] as GearSetup, setup, user.user.minion_equippedPet);
	let content = `You equipped ${equipBank} on your ${setup} setup, and unequipped ${unequipBank}.`;
	if (skillFailBank!.length > 0) {
		content += `\nThese items failed to be equipped as you don't have the requirements: ${skillFailBank}.`;
	}
	return {
		content,
		files: [{ name: 'gear.jpg', attachment: image }]
	};
}

export async function gearEquipCommand(args: {
	interaction: ChatInputCommandInteraction;
	userID: string;
	setup: string;
	item: string | undefined;
	items: string | undefined;
	preset: string | undefined;
	quantity: number | undefined;
	unEquippedItem: Bank | undefined;
	auto: string | undefined;
}): CommandResponse {
	const { interaction, userID, setup, item, items, preset, quantity: _quantity, auto } = args;
	if (!isValidGearSetup(setup)) return 'Invalid gear setup.';
	const user = await mUserFetch(userID);
	if (minionIsBusy(user.id)) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}

	if (items) {
		return gearEquipMultiCommand(user, interaction, setup, items);
	}
	if (setup === 'other' && user.perkTier() < PerkTier.Four) {
		return PATRON_ONLY_GEAR_SETUP;
	}
	if (preset) {
		return gearPresetEquipCommand(user, setup, preset);
	}
	if (auto) {
		return autoEquipCommand(user, setup, auto);
	}
	const itemToEquip = getItem(item);
	if (!itemToEquip) return "You didn't supply the name of an item or preset you want to equip.";
	const quantity = mahojiParseNumber({ input: _quantity ?? 1, min: 1, max: MAX_INT_JAVA }) ?? 1;
	if (!itemToEquip.equipable_by_player || !itemToEquip.equipment) return "This item isn't equipable.";

	const bank = new Bank(user.bank);
	const cost = new Bank().add(itemToEquip.id, quantity);
	if (!bank.has(cost)) return `You don't own ${cost}.`;

	const dbKey = `gear_${setup}` as const;
	const allGear = user.gear;
	const currentEquippedGear = allGear[setup];

	if (!itemToEquip.stackable && quantity > 1) {
		return "You can't equip more than 1 of this item at once, as it isn't stackable!";
	}

	if (itemToEquip.equipment.requirements) {
		if (!user.hasSkillReqs(itemToEquip.equipment.requirements)) {
			return `You can't equip a ${
				itemToEquip.name
			} because you don't have the required stats: ${formatSkillRequirements(
				itemToEquip.equipment.requirements
			)}.`;
		}
	}

	if (setup === 'wildy') {
		await handleMahojiConfirmation(
			interaction,
			"You are equipping items to your **wilderness** setup. *Every* item in this setup can potentially be lost if you're doing activities in the wilderness. Are you sure you want to equip it?"
		);
	}

	const result = currentEquippedGear.equip(itemToEquip, quantity);

	await transactItems({
		userID: user.id,
		collectionLog: false,
		dontAddToTempCL: true,
		itemsToAdd: result.refundBank ?? undefined,
		itemsToRemove: cost
	});

	const { newUser } = await user.update({
		[dbKey]: currentEquippedGear.raw()
	});
	const image = await generateGearImage(user, newUser[dbKey] as GearSetup, setup, user.user.minion_equippedPet);

	return {
		content: `You equipped ${itemToEquip.name} in your ${toTitleCase(setup)} setup.`,
		files: [{ attachment: image, name: 'osbot.png' }]
	};
}

export async function gearUnequipCommand(
	user: MUser,
	gearSetup: string,
	itemToUnequip: string | undefined,
	unequipAll: boolean | undefined
): CommandResponse {
	if (minionIsBusy(user.id)) {
		return `${user.minionName} is currently out on a trip, so you can't change their gear!`;
	}
	if (!isValidGearSetup(gearSetup)) return "That's not a valid gear setup.";
	if (unequipAll) {
		return unEquipAllCommand(user.id, gearSetup);
	}

	const currentEquippedGear = user.gear[gearSetup];
	const currentGear = currentEquippedGear.raw();

	const item = getItem(itemToUnequip);
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

	await user.addItemsToBank({
		items: {
			[equippedInThisSlot!.item]: equippedInThisSlot!.quantity
		},
		collectionLog: false
	});
	await user.update({
		[`gear_${gearSetup}`]: newGear
	});

	const image = await generateGearImage(user, new Gear(newGear), gearSetup, user.user.minion_equippedPet);

	return {
		content: `You unequipped ${item.name} from your ${toTitleCase(gearSetup)} setup.`,
		files: [{ name: 'gear.jpg', attachment: image }]
	};
}

async function autoEquipCommand(user: MUser, gearSetup: GearSetupType, equipmentType: string): CommandResponse {
	if (gearSetup === 'other' && user.perkTier() < PerkTier.Four) {
		return PATRON_ONLY_GEAR_SETUP;
	}

	if (!Object.values(GearStat).includes(equipmentType as any)) {
		return 'Invalid gear stat.';
	}

	const { gearToEquip, toRemoveFromBank, toRemoveFromGear } = getUserBestGearFromBank(
		user.bank,
		user.gear[gearSetup],
		gearSetup,
		user.skillsAsXP,
		equipmentType as GearStat,
		null
	);

	if (Object.keys(toRemoveFromBank).length === 0) {
		return "Couldn't find anything to equip.";
	}

	if (!user.owns(toRemoveFromBank)) {
		return `You dont own ${toRemoveFromBank}!`;
	}

	await user.transactItems({ itemsToRemove: toRemoveFromBank, itemsToAdd: toRemoveFromGear });
	await user.update({
		[`gear_${gearSetup}`]: gearToEquip
	});

	const image = await generateGearImage(user, user.gear[gearSetup], gearSetup, user.user.minion_equippedPet);
	return {
		content: `You auto-equipped your best ${equipmentType} in your ${gearSetup} preset.`,
		files: [{ name: 'gear.jpg', attachment: image }]
	};
}

export async function gearStatsCommand(user: MUser, input: string): CommandResponse {
	const gear = { ...defaultGear };
	for (const name of input.split(',')) {
		const item = getItem(name);
		if (item?.equipment) {
			gear[item.equipment.slot] = { item: item.id, quantity: 1 };
		}
	}
	const image = await generateGearImage(user, new Gear(gear), null, null);
	return { files: [{ name: 'image.jpg', attachment: image }] };
}

export async function gearViewCommand(user: MUser, input: string, text: boolean): CommandResponse {
	if (stringMatches(input, 'all')) {
		const file = text
			? {
					attachment: Buffer.from(
						Object.entries(user.gear)
							.map(i => `${i[0]}: ${i[1].toString()}`)
							.join('\n')
					),
					name: 'gear.txt'
				}
			: { attachment: await generateAllGearImage(user), name: 'osbot.png' };
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
	const image = await generateGearImage(user, gear, input, user.user.minion_equippedPet);
	return { files: [{ attachment: image, name: 'gear.jpg' }] };
}

export async function gearSwapCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	first: GearSetupType,
	second: GearSetupType
) {
	if (!first || !second || first === second || !isValidGearSetup(first) || !isValidGearSetup(second)) {
		return 'Invalid gear setups. You must provide two unique gear setups to switch gear between.';
	}
	if (first === 'wildy' || second === 'wildy') {
		await handleMahojiConfirmation(
			interaction,
			'Are you sure you want to swap your gear with a wilderness setup? You can lose items on your wilderness setup!'
		);
	}

	if ([first, second].includes('other') && user.perkTier() < PerkTier.Four) {
		return PATRON_ONLY_GEAR_SETUP;
	}

	const { gear } = user;

	await user.update({
		[`gear_${first}`]: gear[second],
		[`gear_${second}`]: gear[first]
	});

	return `You swapped your ${first} gear with your ${second} gear.`;
}
