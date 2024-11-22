import type { MINIGAMES, hiscoreURLs, mappedBossNames } from '../constants';
import type Bank from '../structures/Bank';
import type LootTable from '../structures/LootTable';
import type { LootTableRollOptions } from '../structures/LootTable';
import type SimpleMonster from '../structures/SimpleMonster';
import type { MonsterSlayerMaster } from './monsterData';

type ChestSize = 'big' | 'small';
type SeedTier = '1' | '2' | '3' | '4' | '5';

export interface SimpleLootItem {
	id: string;
	dropRate: number;
}

export interface MonsterOptions {
	id: number;
	name: string;
	combatLevel?: number;
	hitpoints?: number;
	aliases?: string[];
	allItems?: number[];
}

export interface Player {
	bossRecords: BossRecords;
	username: string;
	type: keyof typeof hiscoreURLs;
	skills: SkillsScore;
	minigames: MinigamesScore;
	clues: CluesScore;
	leaguePoints?: { rank: number; points: number };
}

export interface SkillsScore {
	overall: SkillScore;
	attack: SkillScore;
	defence: SkillScore;
	strength: SkillScore;
	hitpoints: SkillScore;
	ranged: SkillScore;
	prayer: SkillScore;
	magic: SkillScore;
	cooking: SkillScore;
	woodcutting: SkillScore;
	fletching: SkillScore;
	fishing: SkillScore;
	firemaking: SkillScore;
	crafting: SkillScore;
	smithing: SkillScore;
	mining: SkillScore;
	herblore: SkillScore;
	agility: SkillScore;
	thieving: SkillScore;
	slayer: SkillScore;
	farming: SkillScore;
	runecraft: SkillScore;
	hunter: SkillScore;
	construction: SkillScore;
}

export type BossRecords = Record<(typeof mappedBossNames)[number]['0'], MinigameScore>;

export type MinigamesScore = Record<(typeof MINIGAMES)[number], MinigameScore>;

export interface CluesScore {
	all: MinigameScore;
	beginner: MinigameScore;
	easy: MinigameScore;
	medium: MinigameScore;
	hard: MinigameScore;
	elite: MinigameScore;
	master: MinigameScore;
}

export interface MinigameScore {
	rank: number;
	score: number;
}

export interface SkillScore {
	rank: number;
	level: number;
	xp: number;
}

export type ItemID = number;

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

/**
 * The information about weapon properties.
 */

export interface ItemWeaponStance {
	combat_style: string;
	attack_type: string | null;
	attack_style: string | null;
	experience: string;
	boosts: string | null;
}

export interface ItemWeapon {
	attack_speed: number;
	weapon_type: string;
	stances: ItemWeaponStance[];
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
	cost: number;
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
	wiki_name?: string;
	/**
	 * The OSRS Wiki URL (possibly including anchor link).
	 */
	wiki_url?: string;
	equipment?: ItemEquipment;
	weapon?: ItemWeapon;
	/**
	 * The OSRS Wiki market price for this item, 0 if untradeable or has no price.
	 */
	price: number;
}

export interface DateYearMonth {
	year: number;
	month: number;
}

export interface WikiPage {
	image?: string;
	lastRevisionID: number;
	url: string;
	pageID: number;
	title: string;
	extract?: string;
	categories: {
		title: string;
		ns: number;
	}[];
}

export interface IntKeyBank {
	[key: number]: number;
}
export interface ItemBank {
	[key: string]: number;
}

export interface LootBank {
	[key: string]: Bank;
}

export interface SimpleTableItem<T> {
	item: T;
	weight: number;
}

export interface BankItem {
	id: number;
	qty: number;
}

export type TupleLootItem = [number, number];

export interface MonsterKillOptions {
	/**
	 * This is *true* if the monster is being killed inside the catacombs.
	 */
	inCatacombs?: boolean;
	/**
	 * This is *true* if the monster is being killed inside the wilderness.
	 */
	inWilderness?: boolean;
	/**
	 * This is *true* if the monster being killed is on-task.
	 */
	onSlayerTask?: boolean;
	/**
	 * This is the assigner of this task, if on a task.
	 */
	slayerMaster?: MonsterSlayerMaster;
	/**
	 * If monster is eligible for superior, pass the LootTable.
	 */
	hasSuperiors?: SimpleMonster;
	farmingLevel?: number;
	isAwakened?: boolean;
	lootTableOptions?: LootTableRollOptions;
}

export interface OpenableOptions {
	id: number;
	name: string;
	aliases: string[];
	allItems?: number[];
}

export interface OpenableOpenOptions {
	fishLvl?: number;
	seedTier?: SeedTier;
	chestSize?: ChestSize;
}

export interface ClueOptions {
	table: LootTable;
}

export type CustomKillLogic = (options: MonsterKillOptions, currentLoot: Bank) => void;
