import { GearPreset } from '@prisma/client';
import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import itemID from '../util/itemID';
import { DefenceGearStat, GearSetup, GearStat, OffenceGearStat, OtherGearStat } from './types';

export * from './types';
export * from './util';

// https://oldschool.runescape.wiki/w/Armour/Highest_bonuses
export const maxDefenceStats: { [key in DefenceGearStat]: number } = {
	[GearStat.DefenceCrush]: 505,
	[GearStat.DefenceMagic]: 238,
	[GearStat.DefenceRanged]: 542,
	[GearStat.DefenceSlash]: 521,
	[GearStat.DefenceStab]: 519
};

export const maxOffenceStats: { [key in OffenceGearStat]: number } = {
	[GearStat.AttackCrush]: 214,
	[GearStat.AttackMagic]: 177,
	[GearStat.AttackRanged]: 246,
	[GearStat.AttackSlash]: 182,
	[GearStat.AttackStab]: 177
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
		name: 'clue_hunter',
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
		name: 'spirit_angler',
		user_id: '123',
		head: itemID('Spirit angler headband'),
		neck: null,
		body: itemID('Spirit angler top'),
		legs: itemID('Spirit angler waders'),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID('Spirit angler boots'),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	},
	{
		name: 'pyromancer',
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
	},
	{
		name: 'farmer',
		user_id: '123',
		head: itemID("Farmer's strawhat"),
		neck: null,
		body: itemID("Farmer's jacket"),
		legs: itemID("Farmer's boro trousers"),
		cape: null,
		two_handed: null,
		hands: null,
		feet: itemID("Farmer's boots"),
		shield: null,
		weapon: null,
		ring: null,
		ammo: null,
		ammo_qty: null
	}
];
