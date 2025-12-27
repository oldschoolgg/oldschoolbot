import type { GearStats } from '@/gear/index.js';

export enum EquipmentSlot {
	TwoHanded = '2h',
	Ammo = 'ammo',
	Body = 'body',
	Cape = 'cape',
	Feet = 'feet',
	Hands = 'hands',
	Head = 'head',
	Legs = 'legs',
	Neck = 'neck',
	Ring = 'ring',
	Shield = 'shield',
	Weapon = 'weapon'
}

export interface ItemRequirements {
	attack: number;
	defence: number;
	strength: number;
	hitpoints: number;
	ranged: number;
	prayer: number;
	magic: number;
	cooking: number;
	woodcutting: number;
	fletching: number;
	fishing: number;
	firemaking: number;
	crafting: number;
	smithing: number;
	mining: number;
	herblore: number;
	agility: number;
	thieving: number;
	slayer: number;
	farming: number;
	runecraft: number;
	hunter: number;
	construction: number;
	combat: number;
}

/**
 * The equipment bonuses of equipable armour/weapons.
 */
export type ItemEquipment = GearStats & {
	slot: EquipmentSlot;
	requirements: Partial<ItemRequirements> | null;
};

/**
 * A representation of an Old School RuneScape (OSRS) item.
 */
export interface Item {
	/**
	 * Unique OSRS item ID number.
	 */
	id: number;
	/**
	 * Name of the item.
	 */
	name: string;
	high_alch?: number;
	low_alch?: number;
	/**
	 * If the item is a members-only.
	 */
	members?: boolean;
	/**
	 * If the item is tradeable (between players and on the GE).
	 */
	tradeable?: boolean;
	/**
	 * If the item is tradeable (only on GE).
	 */
	tradeable_on_ge?: boolean;
	/**
	 * If the item is stackable (in inventory).
	 */
	stackable?: boolean;
	/**
	 * If the item is noteable.
	 */
	noteable?: boolean;
	/**
	 * If the item is equipable (based on right-click menu entry).
	 */
	equipable?: true;
	/**
	 * The store price of an item.
	 */
	cost?: number;
	/**
	 * The GE buy limit of the item.
	 */
	buy_limit?: number;
	/**
	 * The OSRS Wiki name for the item.
	 */
	equipment?: ItemEquipment;
	weapon?: ItemWeapon;
	/**
	 * The OSRS Wiki market price for this item, 0 if untradeable or has no price.
	 */
	price?: number;
}

export interface ItemWeaponStance {
	combat_style: string;
	attack_type: string | null;
	attack_style: string | null;
	experience: string;
	boosts: string | null;
}

export interface ItemWeapon {
	attack_speed: number | null;
	weapon_type?: string;
	// stances?: ItemWeaponStance[];
}

export enum ItemVisibility {
	// Normal items.
	Regular,
	// Valid items, but should never be available in OSB (e.g. leagues items)
	Unobtainable,
	// Never add under any circumstance (e.g. null items, noted items, etc)
	NeverAdd
}

export * from './item-lists.js';
export * from './itemVisibility.js';

export type FullItem = {
	id: number;
	name: string;
	config_name: string;

	destroy?: string;
	examine?: string;
	worn_options?: string[];
	aka?: string;
	removal?: string;
	removal_update?: string;
	value?: number;
	buy_limit?: number;
	equipment?: GearStats & {
		slot: EquipmentSlot;
		requirements: Partial<ItemRequirements> | null;
	};
	weapon?: ItemWeapon;
	price?: number;

	// Booleans
	members: boolean;
	tradeable: boolean;
	tradeable_on_ge: boolean;
	stackable: boolean;
	noteable: boolean;
	equipable: boolean;
};
