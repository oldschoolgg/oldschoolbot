import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

import { GearPresetsTable } from '../../typeorm/GearPresetsTable.entity';
import { itemNameFromID } from '../../util';
import { GearSetup } from '../types';

const keys = [
	'TwoHanded',
	'Body',
	'Cape',
	'Feet',
	'Hands',
	'Legs',
	'Neck',
	'Ring',
	'Head',
	'Shield',
	'Weapon'
] as const;

export function gearPresetToStr(preset: GearPresetsTable) {
	let parsed = [];
	for (const key of keys) {
		let val = preset[key];
		if (val) parsed.push(itemNameFromID(val));
	}
	if (preset.Ammo) {
		parsed.push(`${preset.AmmoQuantity}x ${itemNameFromID(preset.Ammo)}`);
	}
	return parsed.join(', ');
}

export function gearPresetToBank(preset: GearPresetsTable) {
	const bank = new Bank();

	for (const key of [
		'TwoHanded',
		'Body',
		'Cape',
		'Feet',
		'Hands',
		'Legs',
		'Neck',
		'Ring',
		'Head',
		'Shield',
		'Weapon'
	] as const) {
		const val = preset[key];
		if (val !== null) {
			bank.add(val);
		}
	}

	if (preset.Ammo) {
		bank.add(preset.Ammo, preset.AmmoQuantity ?? 1);
	}

	return bank;
}

export function convertGearSetupToBank(setup: GearSetup) {
	let bank = new Bank();
	for (const item of Object.values(setup)) {
		if (!item) continue;
		bank.add(item.item, item.quantity);
	}
	return bank;
}

export const globalPresets = [
	{
		name: 'graceful',
		userID: '123',
		Head: itemID('Graceful hood'),
		Neck: null,
		Body: itemID('Graceful top'),
		Legs: itemID('Graceful legs'),
		Cape: itemID('Graceful cape'),
		TwoHanded: null,
		Hands: itemID('Graceful gloves'),
		Feet: itemID('Graceful boots'),
		Shield: null,
		Weapon: null,
		Ring: null,
		Ammo: null,
		AmmoQuantity: null
	},

	{
		name: 'carpenter',
		userID: '123',
		Head: itemID("Carpenter's helmet"),
		Neck: null,
		Body: itemID("Carpenter's shirt"),
		Legs: itemID("Carpenter's trousers"),
		Cape: null,
		TwoHanded: null,
		Hands: null,
		Feet: itemID("Carpenter's boots"),
		Shield: null,
		Weapon: null,
		Ring: null,
		Ammo: null,
		AmmoQuantity: null
	},

	{
		name: 'rogue',
		userID: '123',
		Head: itemID('Rogue mask'),
		Neck: null,
		Body: itemID('Rogue top'),
		Legs: itemID('Rogue trousers'),
		Cape: null,
		TwoHanded: null,
		Hands: itemID('Rogue gloves'),
		Feet: itemID('Rogue boots'),
		Shield: null,
		Weapon: null,
		Ring: null,
		Ammo: null,
		AmmoQuantity: null
	},

	{
		name: 'clue',
		userID: '123',
		Head: itemID('Helm of raedwald'),
		Neck: null,
		Body: itemID('Clue hunter garb'),
		Legs: itemID('Clue hunter trousers'),
		Cape: itemID('Clue hunter cloak'),
		TwoHanded: null,
		Hands: itemID('Clue hunter gloves'),
		Feet: itemID('Clue hunter boots'),
		Shield: null,
		Weapon: null,
		Ring: null,
		Ammo: null,
		AmmoQuantity: null
	},

	{
		name: 'angler',
		userID: '123',
		Head: itemID('Angler hat'),
		Neck: null,
		Body: itemID('Angler top'),
		Legs: itemID('Angler waders'),
		Cape: null,
		TwoHanded: null,
		Hands: null,
		Feet: itemID('Angler boots'),
		Shield: null,
		Weapon: null,
		Ring: null,
		Ammo: null,
		AmmoQuantity: null
	},

	{
		name: 'pyro',
		userID: '123',
		Head: itemID('Pyromancer hood'),
		Neck: null,
		Body: itemID('Pyromancer garb'),
		Legs: itemID('	Pyromancer robe'),
		Cape: null,
		TwoHanded: null,
		Hands: null,
		Feet: itemID('Pyromancer boots'),
		Shield: null,
		Weapon: null,
		Ring: null,
		Ammo: null,
		AmmoQuantity: null
	},

	{
		name: 'prospector',
		userID: '123',
		Head: itemID('Prospector helmet'),
		Neck: null,
		Body: itemID('Prospector jacket'),
		Legs: itemID('Prospector legs'),
		Cape: null,
		TwoHanded: null,
		Hands: null,
		Feet: itemID('Prospector boots'),
		Shield: null,
		Weapon: null,
		Ring: null,
		Ammo: null,
		AmmoQuantity: null
	}
];
