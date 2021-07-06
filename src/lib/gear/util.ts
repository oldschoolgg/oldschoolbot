import { EquipmentSlot, Item } from 'oldschooljs/dist/meta/types';

import { UserSettings } from '../settings/types/UserSettings';
import { Gear } from '../structures/Gear';
import { itemID, toTitleCase } from '../util';
import getOSItem from '../util/getOSItem';
import { GearSetup, GearSetupType } from '.';

export function itemInSlot(setup: GearSetup, slot: EquipmentSlot): [null, null] | [Item, number] {
	const equipped = setup[slot];
	if (!equipped) return [null, null];
	return [getOSItem(equipped.item), equipped.quantity];
}

export function readableStatName(slot: string) {
	return toTitleCase(slot.replace('_', ' '));
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

export type PartialGearSetup = Partial<
	{
		[key in EquipmentSlot]: string;
	}
>;
export function constructGearSetup(setup: PartialGearSetup): Gear {
	return new Gear({
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
	});
}

export function hasGracefulEquipped(setup: Gear) {
	return setup.hasEquipped(
		['Graceful hood', 'Graceful top', 'Graceful legs', 'Graceful boots', 'Graceful boots', 'Graceful cape'],
		true
	);
}

export function hasGlobetrotterEquipped(setup: Gear) {
	return setup.hasEquipped(
		[
			'Globetrotter headress',
			'Globetrotter  top',
			'Globetrotter  legs',
			'Globetrotter  boots',
			'Globetrotter  boots',
			'Globetrotter backpack'
		],
		true
	);
}
