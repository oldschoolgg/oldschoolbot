import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { GearSetupType } from './gear';
import { ClientSettings } from './settings/types/ClientSettings';
import { assert } from './util';
import getOSItem from './util/getOSItem';

interface DegradeableItem {
	item: Item;
	settingsKey: 'tentacle_charges' | 'sang_charges';
	itemsToRefundOnBreak: Bank;
	setup: GearSetupType;
	aliases: string[];
	chargeInput: {
		cost: Bank;
		charges: number;
	};
	unchargedItem?: Item;
	convertOnCharge?: boolean;
}

export const degradeableItems: DegradeableItem[] = [
	{
		item: getOSItem('Abyssal tentacle'),
		settingsKey: 'tentacle_charges',
		itemsToRefundOnBreak: new Bank().add('Abyssal tentacle'),
		setup: 'melee',
		aliases: ['tentacle', 'tent'],
		chargeInput: {
			cost: new Bank().add('Abyssal whip'),
			charges: 10_000
		}
	},
	{
		item: getOSItem('Sanguinesti staff'),
		settingsKey: 'sang_charges',
		itemsToRefundOnBreak: new Bank().add('Sanguinesti staff (uncharged)'),
		setup: 'mage',
		aliases: ['sang', 'sang staff', 'sanguinesti staff', 'sanguinesti'],
		chargeInput: {
			cost: new Bank().add('Blood rune', 3),
			charges: 1
		},
		unchargedItem: getOSItem('Sanguinesti staff (uncharged)'),
		convertOnCharge: true
	}
];

export function checkUserCanUseDegradeableItem({
	item,
	chargesToDegrade,
	user
}: {
	item: Item;
	chargesToDegrade: number;
	user: KlasaUser;
}): { hasEnough: true } | { hasEnough: false; userMessage: string } {
	const degItem = degradeableItems.find(i => i.item === item);
	if (!degItem) throw new Error('Invalid degradeable item');
	const currentCharges = user.settings.get(degItem.settingsKey) as number;
	assert(typeof currentCharges === 'number');
	const newCharges = currentCharges - chargesToDegrade;
	if (newCharges < 0) {
		return {
			hasEnough: false,
			userMessage: `${user.username}, your ${item.name} has only ${currentCharges} charges remaining, but you need ${chargesToDegrade}.`
		};
	}
	return {
		hasEnough: true
	};
}

export async function degradeItem({
	item,
	chargesToDegrade,
	user
}: {
	item: Item;
	chargesToDegrade: number;
	user: KlasaUser;
}) {
	const degItem = degradeableItems.find(i => i.item === item);
	if (!degItem) throw new Error('Invalid degradeable item');

	const currentCharges = user.settings.get(degItem.settingsKey) as number;
	assert(typeof currentCharges === 'number');
	const newCharges = currentCharges - chargesToDegrade;

	if (newCharges <= 0) {
		// If no more charges left, break and refund the item.
		const hasEquipped = user.getGear(degItem.setup).equippedWeapon() === item;
		const hasInBank = user.owns(item.id);
		await user.settings.update(degItem.settingsKey, 0);
		const itemsDeleted = new Bank().add(item.id);

		if (hasEquipped) {
			// If its equipped, unequip and delete it.
			const gear = { ...user.getGear(degItem.setup).raw() };
			gear.weapon = null;
			await user.settings.update(`gear.${degItem.setup}`, gear);
			await user.client.settings!.update(ClientSettings.EconomyStats.DegradedItemsCost, itemsDeleted);
			if (degItem.itemsToRefundOnBreak)
				await user.addItemsToBank({ items: degItem.itemsToRefundOnBreak, collectionLog: false });
		} else if (hasInBank) {
			// If its in bank, just remove 1 from bank.
			await user.removeItemsFromBank(new Bank().add(item.id, 1));
			await user.client.settings!.update(ClientSettings.EconomyStats.DegradedItemsCost, itemsDeleted);
			if (degItem.itemsToRefundOnBreak)
				await user.addItemsToBank({ items: degItem.itemsToRefundOnBreak, collectionLog: false });
		} else {
			// If its not in bank OR equipped, something weird has gone on.
			throw new Error(
				`${user.sanitizedName} had missing ${item.name} when trying to degrade by ${chargesToDegrade}`
			);
		}

		return {
			userMessage: `Your ${item.name} ran out of charges and broke.`
		};
	}
	// If it has charges left still, just remove those charges and nothing else.
	await user.settings.update(degItem.settingsKey, newCharges);
	const chargesAfter = user.settings.get(degItem.settingsKey);
	assert(typeof chargesAfter === 'number' && chargesAfter > 0);
	return {
		userMessage: `Your ${item.name} degraded by ${chargesToDegrade} charges, and now has ${chargesAfter} remaining.`
	};
}
