import { User } from '@prisma/client';
import { KlasaClient, KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';
import { EquipmentSlot, ItemBank } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA, PATRON_ONLY_GEAR_SETUP, PerkTier } from '../../../lib/constants';
import { GearSetup } from '../../../lib/gear';
import { generateGearImage } from '../../../lib/gear/functions/generateGearImage';
import { formatSkillRequirements, isValidGearSetup, skillsMeetRequirements, toTitleCase } from '../../../lib/util';
import { getItem } from '../../../lib/util/getOSItem';
import getUsersPerkTier from '../../../lib/util/getUsersPerkTier';
import { minionIsBusy } from '../../../lib/util/minionIsBusy';
import { minionName } from '../../../lib/util/minionUtils';
import {
	getSkillsOfMahojiUser,
	handleMahojiConfirmation,
	mahojiParseNumber,
	mahojiUserSettingsUpdate
} from '../../mahojiSettings';

export async function gearPresetEquipCommand() {
	return 'hi';
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
		return gearPresetEquipCommand();
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
	const currentEquippedGear = user[dbKey] as GearSetup;

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
