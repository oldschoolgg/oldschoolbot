import { GearPreset, User } from '@prisma/client';
import { objectValues } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';
import { EquipmentSlot, ItemBank } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA, PATRON_ONLY_GEAR_SETUP, PerkTier } from '../../../lib/constants';
import { defaultGear, GearSetup, globalPresets } from '../../../lib/gear';
import { generateGearImage } from '../../../lib/gear/functions/generateGearImage';
import { unEquipAllCommand } from '../../../lib/minions/functions/unequipAllCommand';
import { prisma } from '../../../lib/settings/prisma';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { Gear } from '../../../lib/structures/Gear';
import {
	assert,
	formatSkillRequirements,
	isValidGearSetup,
	skillsMeetRequirements,
	toTitleCase
} from '../../../lib/util';
import { getItem } from '../../../lib/util/getOSItem';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { minionName } from '../../../lib/util/minionUtils';
import {
	getSkillsOfMahojiUser,
	getUserGear,
	handleMahojiConfirmation,
	mahojiParseNumber,
	mahojiUserSettingsUpdate
} from '../../mahojiSettings';

export async function gearPresetEquipCommand(user: KlasaUser, gearSetup: string, presetName: string): CommandResponse {
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

	const toRemove = new Bank();
	function gearItem(val: null | number) {
		if (val === null) return null;
		toRemove.add(val);
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

	if (preset.ammo) {
		newGear.ammo = { item: preset.ammo, quantity: preset.ammo_qty! };
		toRemove.add(preset.ammo, preset.ammo_qty!);
	}

	const userBankWithEquippedItems = user.bank().clone();
	for (const e of objectValues(user.getGear(gearSetup).raw())) {
		if (e) userBankWithEquippedItems.add(e.item, e.quantity);
	}

	if (!userBankWithEquippedItems.has(toRemove.bank)) {
		return `You don't have the items in this preset. You're missing: ${toRemove.remove(user.bank())}.`;
	}

	await unEquipAllCommand(user, gearSetup);

	await user.removeItemsFromBank(toRemove.bank);

	const { newUser } = await mahojiUserSettingsUpdate(user.client, user.id, {
		[`gear_${gearSetup}`]: newGear
	});
	const updatedGear = getUserGear(newUser)[gearSetup];
	const image = await generateGearImage(
		user.client as KlasaClient,
		user,
		updatedGear,
		gearSetup,
		user.settings.get(UserSettings.Minion.EquippedPet)
	);

	return {
		content: `You equipped the ${preset.name} preset in your ${gearSetup} setup.`,
		attachments: [{ fileName: 'gear.jpg', buffer: image }]
	};
}

export async function gearEquipCommand(args: {
	interaction: SlashCommandInteraction;
	user: User;
	klasaUser: KlasaUser;
	setup: string;
	item: string | undefined;
	preset: string | undefined;
	quantity: number | undefined;
	unEquippedItem: Bank | undefined;
}): CommandResponse {
	const { interaction, user, klasaUser, setup, item, preset, quantity: _quantity } = args;
	if (!isValidGearSetup(setup)) return 'Invalid gear setup.';
	if (minionIsBusy(user.id)) {
		return `${minionName(user)} is currently out on a trip, so you can't change their gear!`;
	}
	if (preset) {
		return gearPresetEquipCommand(klasaUser, setup, preset);
	}
	const itemToEquip = getItem(item);
	if (!itemToEquip) return "You didn't supply the name of an item or preset you want to equip.";
	const quantity = mahojiParseNumber({ input: _quantity ?? 1, min: 1, max: MAX_INT_JAVA }) ?? 1;
	if (!itemToEquip.equipable_by_player || !itemToEquip.equipment) return "This item isn't equippable.";

	const bank = new Bank(user.bank as ItemBank);
	const cost = new Bank().add(itemToEquip.id, quantity);
	if (!bank.has(cost)) return `You don't own ${cost}.`;

	const { slot } = itemToEquip.equipment!;
	const dbKey = `gear_${setup}` as const;
	const allGear = getUserGear(user);
	const currentEquippedGear = allGear[setup];

	if (setup === 'other' && getUsersPerkTier(user) < PerkTier.Four) {
		return PATRON_ONLY_GEAR_SETUP;
	}

	/**
	 * Handle 2h items
	 */
	if (
		slot === EquipmentSlot.TwoHanded &&
		(currentEquippedGear[EquipmentSlot.Weapon] || currentEquippedGear[EquipmentSlot.Shield])
	) {
		return "You can't equip this two-handed item because you have items equipped in your weapon/shield slots.";
	}

	if (
		[EquipmentSlot.Weapon, EquipmentSlot.Shield, EquipmentSlot.TwoHanded].includes(slot) &&
		currentEquippedGear[EquipmentSlot.TwoHanded]
	) {
		return "You can't equip this weapon or shield, because you have a 2H weapon equipped, and need to unequip it first.";
	}

	if (!itemToEquip.stackable && quantity > 1) {
		return "You can't equip more than 1 of this item at once, as it isn't stackable!";
	}

	if (itemToEquip.equipment?.requirements) {
		if (!skillsMeetRequirements(getSkillsOfMahojiUser(user), itemToEquip.equipment.requirements)) {
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
	/**
	 * If there's already an item equipped in this slot, unequip it,
	 * then recursively call this function again.
	 */
	const equippedInThisSlot = currentEquippedGear[slot];
	if (equippedInThisSlot) {
		const newGear = { ...currentEquippedGear };
		newGear[slot] = null;

		const loot = new Bank().add(equippedInThisSlot.item, equippedInThisSlot.quantity);
		await klasaUser.addItemsToBank({ items: loot, collectionLog: false });
		await mahojiUserSettingsUpdate(klasaUser.client, user.id, {
			[dbKey]: newGear
		});
		return gearEquipCommand({
			interaction,
			user,
			klasaUser,
			setup,
			item,
			preset,
			quantity,
			unEquippedItem: loot
		});
	}

	await klasaUser.removeItemsFromBank(cost);

	const newGear = { ...currentEquippedGear };
	newGear[slot] = {
		item: itemToEquip.id,
		quantity
	};

	const { newUser } = await mahojiUserSettingsUpdate(klasaUser.client, user.id, {
		[dbKey]: newGear
	});
	const image = await generateGearImage(
		klasaUser.client as KlasaClient,
		user,
		newUser[dbKey] as GearSetup,
		setup,
		user.minion_equippedPet
	);

	return {
		content: `You equipped ${itemToEquip.name} in your ${toTitleCase(setup)} setup.`,
		attachments: [{ buffer: image, fileName: 'osbot.png' }]
	};
}

export async function gearUnequipCommand(
	klasaUser: KlasaUser,
	user: User,
	gearSetup: string,
	itemToUnequip: string | undefined,
	unequipAll: boolean | undefined
): CommandResponse {
	if (minionIsBusy(user.id)) {
		return `${minionName(user)} is currently out on a trip, so you can't change their gear!`;
	}
	if (!isValidGearSetup(gearSetup)) return "That's not a valid gear setup.";
	if (unequipAll) {
		return unEquipAllCommand(klasaUser, gearSetup);
	}

	const currentEquippedGear = getUserGear(user)[gearSetup];
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

	await klasaUser.addItemsToBank({
		items: {
			[equippedInThisSlot!.item]: equippedInThisSlot!.quantity
		},
		collectionLog: false
	});
	await mahojiUserSettingsUpdate(klasaUser.client, user.id, {
		[`gear_${gearSetup}`]: newGear
	});

	const image = await generateGearImage(
		klasaUser.client as KlasaClient,
		user,
		new Gear(newGear),
		gearSetup,
		user.minion_equippedPet
	);

	return {
		content: `You unequipped ${item.name} from your ${toTitleCase(gearSetup)} setup.`,
		attachments: [{ fileName: 'gear.jpg', buffer: image }]
	};
}
