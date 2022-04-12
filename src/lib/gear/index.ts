import { GearPreset } from '@prisma/client';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import itemID from '../util/itemID';
import { DefenceGearStat, GearSetup, GearStat, OffenceGearStat, OtherGearStat } from './types';

export * from './types';
export * from './util';

export const maxDefenceStats: { [key in DefenceGearStat]: number } = {
	[GearStat.DefenceCrush]: 789,
	[GearStat.DefenceMagic]: 480,
	[GearStat.DefenceRanged]: 681,
	[GearStat.DefenceSlash]: 637,
	[GearStat.DefenceStab]: 640
};

export const maxOffenceStats: { [key in OffenceGearStat]: number } = {
	[GearStat.AttackCrush]: 360,
	[GearStat.AttackMagic]: 459,
	[GearStat.AttackRanged]: 431,
	[GearStat.AttackSlash]: 295,
	[GearStat.AttackStab]: 361
};

export const maxOtherStats: { [key in OtherGearStat]: number } = {
	[GearStat.MeleeStrength]: 243,
	[GearStat.RangedStrength]: 172,
	[GearStat.MagicDamage]: 51,
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
Object.freeze(defaultGear);

export const globalPresets: GearPreset[] = [
	{
		name: 'graceful',
		user_id: '123',
		head: itemID('Graceful hood'),
		neck: null,
		body: itemID('Graceful top'),
		legs: itemID('Graceful legs'),
		cape: itemID('Graceful cape'),
		two_handed: null,
		hands: itemID('Graceful gloves'),
		feet: itemID('Graceful boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	},

	{
		name: 'carpenter',
		user_id: '123',
		head: itemID("Carpenter's helmet"),
		neck: null,
		body: itemID("Carpenter's shirt"),
		legs: itemID("Carpenter's trousers"),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID("Carpenter's boots"),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	},

	{
		name: 'rogue',
		user_id: '123',
		head: itemID('Rogue mask'),
		neck: null,
		body: itemID('Rogue top'),
		legs: itemID('Rogue trousers'),
		cape: null,
		two_handed: null,
		hands: itemID('Rogue gloves'),
		feet: itemID('Rogue boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	},

	{
		name: 'clue',
		user_id: '123',
		head: itemID('Helm of raedwald'),
		neck: null,
		body: itemID('Clue hunter garb'),
		legs: itemID('Clue hunter trousers'),
		cape: itemID('Clue hunter cloak'),
		two_handed: null,
		hands: itemID('Clue hunter gloves'),
		feet: itemID('Clue hunter boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	},

	{
		name: 'angler',
		user_id: '123',
		head: itemID('Angler hat'),
		neck: null,
		body: itemID('Angler top'),
		legs: itemID('Angler waders'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Angler boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	},

	{
		name: 'pyro',
		user_id: '123',
		head: itemID('Pyromancer hood'),
		neck: null,
		body: itemID('Pyromancer garb'),
		legs: itemID('Pyromancer robe'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Pyromancer boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	},

	{
		name: 'prospector',
		user_id: '123',
		head: itemID('Prospector helmet'),
		neck: null,
		body: itemID('Prospector jacket'),
		legs: itemID('Prospector legs'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Prospector boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	},

	{
		name: 'lumberjack',
		user_id: '123',
		head: itemID('Lumberjack hat'),
		neck: null,
		body: itemID('Lumberjack top'),
		legs: itemID('Lumberjack legs'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Lumberjack boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	}
];
