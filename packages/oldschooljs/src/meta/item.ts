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
export interface ItemEquipment {
	attack_stab: number;
	attack_slash: number;
	attack_crush: number;
	attack_magic: number;
	attack_ranged: number;
	defence_stab: number;
	defence_slash: number;
	defence_crush: number;
	defence_magic: number;
	defence_ranged: number;
	melee_strength: number;
	ranged_strength: number;
	magic_damage: number;
	prayer: number;
	slot: EquipmentSlot;
	requirements: Partial<ItemRequirements> | null;
}

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
	/**
	 * If the item has incomplete wiki data.
	 */
	incomplete?: boolean;
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
	 * If the item is equipable by a player and is equipable in-game.
	 */
	equipable_by_player?: true;
	equipable_weapon?: true;
	/**
	 * The store price of an item.
	 */
	cost?: number;
	/**
	 * The low alchemy value of the item (cost * 0.4).
	 */
	lowalch?: number;
	/**
	 * The high alchemy value of the item (cost * 0.6).
	 */
	highalch?: number;
	/**
	 * The GE buy limit of the item.
	 */
	buy_limit?: number;
	/**
	 * The OSRS Wiki name for the item.
	 */
	wiki_name?: string | null; // null for interface items
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
	stances?: ItemWeaponStance[];
}
