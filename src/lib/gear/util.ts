import { objectValues } from 'e';
import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import { getSimilarItems } from '../data/similarItems';
import { UserSettings } from '../settings/types/UserSettings';
import { itemID, toTitleCase } from '../util';
import getOSItem from '../util/getOSItem';
import { GearRequired, GearSetup, GearSetupType } from '.';

export function itemInSlot(setup: GearSetup, slot: EquipmentSlot): [null, null] | [Item, number] {
	const equipped = setup[slot];
	if (!equipped) return [null, null];
	return [getOSItem(equipped.item), equipped.quantity];
}

export function readableStatName(slot: string) {
	return toTitleCase(slot.replace('_', ' '));
}

export function hasItemEquipped(item: number, setup: GearSetup) {
	for (const i of getSimilarItems(item)) {
		const osItem = getOSItem(i);
		if (!osItem.equipment) return false;
		const itemInSlot = setup[osItem.equipment.slot];
		if (!itemInSlot) return false;
		if (itemInSlot.item === i) {
			return true;
		}
	}
	return false;
}

export function hasArrayOfItemsEquipped(items: number[], setup: GearSetup) {
	for (const item of items) {
		if (!hasItemEquipped(item, setup)) return false;
	}
	return true;
}

export function hasGearEquipped(setup: GearSetup, reqs: GearRequired): boolean {
	for (const items of objectValues(reqs)) {
		if (!items) continue;

		for (let i = 0; i < items.length; i++) {
			if (hasItemEquipped(items[i], setup)) {
				break;
			} else if (i === items.length - 1) {
				return false;
			}
		}
	}

	return true;
}

export function resolveGearTypeSetting(type: GearSetupType) {
	switch (type) {
		case 'melee':
			return UserSettings.Gear.Melee;
		case 'mage':
			return UserSettings.Gear.Mage;
		case 'range':
			return UserSettings.Gear.Range;
		case 'skilling':
			return UserSettings.Gear.Skilling;
		case 'misc':
			return UserSettings.Gear.Misc;
	}
}

type PartialGearSetup = Partial<
	{
		[key in EquipmentSlot]: string;
	}
>;
export function constructGearSetup(setup: PartialGearSetup): GearSetup {
	return {
		'2h': setup['2h'] ? { item: itemID(setup['2h']), quantity: 1 } : null,
		ammo: setup.ammo ? { item: itemID(setup.ammo), quantity: 1 } : null,
		body: setup.body ? { item: itemID(setup.body), quantity: 1 } : null,
		cape: setup.cape ? { item: itemID(setup.cape), quantity: 1 } : null,
		feet: setup.feet ? { item: itemID(setup.feet), quantity: 1 } : null,
		hands: setup.hands ? { item: itemID(setup.hands), quantity: 1 } : null,
		head: setup.head ? { item: itemID(setup.head), quantity: 1 } : null,
		legs: setup.legs ? { item: itemID(setup.legs), quantity: 1 } : null,
		neck: setup.neck ? { item: itemID(setup.neck), quantity: 1 } : null,
		ring: setup.ring ? { item: itemID(setup.ring), quantity: 1 } : null,
		shield: setup.shield ? { item: itemID(setup.shield), quantity: 1 } : null,
		weapon: setup.weapon ? { item: itemID(setup.weapon), quantity: 1 } : null
	};
}
