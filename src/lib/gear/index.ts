import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { itemID } from '../util';
import { DefenceGearStat, GearSetup, GearStat, OffenceGearStat, OtherGearStat } from './types';

export * from './types';
export * from './util';

export const maxDefenceStats: { [key in DefenceGearStat]: number } = {
	[GearStat.DefenceCrush]: 621,
	[GearStat.DefenceMagic]: 461,
	[GearStat.DefenceRanged]: 659,
	[GearStat.DefenceSlash]: 621,
	[GearStat.DefenceStab]: 622
};

export const maxOffenceStats: { [key in OffenceGearStat]: number } = {
	[GearStat.AttackCrush]: 300,
	[GearStat.AttackMagic]: 436,
	[GearStat.AttackRanged]: 391,
	[GearStat.AttackSlash]: 273,
	[GearStat.AttackStab]: 274
};

export const maxOtherStats: { [key in OtherGearStat]: number } = {
	[GearStat.MeleeStrength]: 204,
	[GearStat.RangedStrength]: 172,
	[GearStat.MagicDamage]: 38,
	[GearStat.Prayer]: 66
};

export const defaultGear: GearSetup = {
	[EquipmentSlot.TwoHanded]: null,
	[EquipmentSlot.Ammo]: null,
	[EquipmentSlot.Body]: null,
	[EquipmentSlot.Cape]: null,
	[EquipmentSlot.Feet]: null,
	[EquipmentSlot.Hands]: null,
	[EquipmentSlot.Head]: null,
	[EquipmentSlot.Legs]: null,
	[EquipmentSlot.Neck]: null,
	[EquipmentSlot.Ring]: null,
	[EquipmentSlot.Shield]: null,
	[EquipmentSlot.Weapon]: null
};

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
	},

	{
		name: 'lumberjack',
		userID: '123',
		Head: itemID('Lumberjack hat'),
		Neck: null,
		Body: itemID('Lumberjack top'),
		Legs: itemID('Lumberjack legs'),
		Cape: null,
		TwoHanded: null,
		Hands: null,
		Feet: itemID('Lumberjack boots'),
		Shield: null,
		Weapon: null,
		Ring: null,
		Ammo: null,
		AmmoQuantity: null
	}
];
