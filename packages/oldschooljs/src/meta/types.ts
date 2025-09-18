import type LootTable from '@/structures/LootTable.js';

type ChestSize = 'big' | 'small';
type SeedTier = '1' | '2' | '3' | '4' | '5';

export interface SimpleLootItem {
	id: string;
	dropRate: number;
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

export interface SimpleTableItem<T> {
	item: T;
	weight: number;
}


export type TupleLootItem = [number, number];

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
