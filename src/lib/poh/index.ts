import type { PlayerOwnedHouse } from '@prisma/client';
import { objectEntries } from 'e';
import { Bank } from 'oldschooljs';

import type { LevelRequirements } from '../skilling/types';
import { Amulets } from './objects/amulets';
import { DungeonDecorations } from './objects/dungeon_decorations';
import { GardenDecorations } from './objects/garden_decorations';
import { Guards } from './objects/guards';
import { JewelleryBoxes } from './objects/jewellery_boxes';
import { MountedCapes } from './objects/mounted_capes';
import { MountedFish } from './objects/mounted_fish';
import { MountedHeads } from './objects/mounted_heads';
import { MountedItems } from './objects/mounted_items';
import { Pools } from './objects/pools';
import { PrayerAltars } from './objects/prayer_altars';
import { Prisons } from './objects/prisons';
import { SpellbookAltars } from './objects/spellbook_altars';
import { Teleports } from './objects/teleports';
import { Thrones } from './objects/thrones';
import { Torches } from './objects/torches';

export const HOUSE_WIDTH = 585;
export const TOP_FLOOR_Y = 118;

export const GROUND_FLOOR_Y = 236;
export const DUNGEON_FLOOR_Y = 351;
const FLOOR_HEIGHT = 112;
const GARDEN_X = 587;
const GARDEN_Y = 236;

type PoHSlot = keyof Omit<PlayerOwnedHouse, 'background_id' | 'user_id'>;

export interface PoHObject {
	id: number;
	name: string;
	requiredInPlace?: number;
	itemCost?: Bank;
	slot: PoHSlot;
	level: number | LevelRequirements;
	refundItems?: boolean;
	canBuild?: (user: MUser) => Promise<boolean>;
}

export const Placeholders: Partial<Record<PoHSlot, [number, [number, number][]]>> = {
	// Ground floor
	mounted_head: [15_382, [[430, GROUND_FLOOR_Y - 60]]],
	mounted_fish: [15_383, [[240, GROUND_FLOOR_Y - 70]]],
	throne: [15_426, [[HOUSE_WIDTH / 2, GROUND_FLOOR_Y]]],
	mounted_cape: [29_144, [[220, GROUND_FLOOR_Y]]],
	jewellery_box: [29_142, [[369, GROUND_FLOOR_Y]]],
	mounted_item: [1111, [[80, GROUND_FLOOR_Y - 70]]],
	amulet: [33_417, [[190, GROUND_FLOOR_Y - 65]]],

	// Top floor
	prayer_altar: [15_270, [[175, TOP_FLOOR_Y]]],
	spellbook_altar: [29_140, [[60, TOP_FLOOR_Y]]],

	// Dungeon
	guard: [15_323, [[350, DUNGEON_FLOOR_Y]]],
	torch: [
		15_330,
		[
			[50, DUNGEON_FLOOR_Y - FLOOR_HEIGHT / 2],
			[HOUSE_WIDTH - 50, DUNGEON_FLOOR_Y - FLOOR_HEIGHT / 2]
		]
	],
	dungeon_decoration: [15_331, [[100, DUNGEON_FLOOR_Y]]],
	prison: [15_352, [[100, DUNGEON_FLOOR_Y]]],

	// Garden
	pool: [29_122, [[GARDEN_X + HOUSE_WIDTH / 6, GARDEN_Y]]],
	teleport: [29_120, [[GARDEN_X + HOUSE_WIDTH / 2, GARDEN_Y]]],
	garden_decoration: [2_342_341, [[GARDEN_X + HOUSE_WIDTH * 0.82, GARDEN_Y]]]
};

export const itemsNotRefundable = new Bank()
	.add('Plank', 10_000)
	.add('Oak plank', 10_000)
	.add('Teak plank', 10_000)
	.add('Mahogany plank', 10_000)
	.add('Steel bar', 10_000)
	.add('Bolt of cloth', 10_000)
	.add('Limestone brick', 10_000)
	.add('Gold leaf', 10_000)
	.add('Marble block', 10_000)
	.add('Magic stone', 10_000);

export const GroupedPohObjects = {
	Thrones,
	JewelleryBoxes,
	Amulets,
	MountedCapes,
	PrayerAltars,
	SpellbookAltars,
	MountedFish,
	MountedHeads,
	Guards,
	Pools,
	Teleports,
	Torches,
	DungeonDecorations,
	Prisons,
	MountedItems,
	GardenDecorations
};

export const PoHObjects = Object.values(GroupedPohObjects).flat(Number.POSITIVE_INFINITY) as PoHObject[];

export const getPOHObject = (idOrName: number | string) => {
	const key = typeof idOrName === 'string' ? 'name' : 'id';
	const obj = PoHObjects.find(i => i[key] === idOrName);
	if (!obj) throw new Error(`POH Object with id/name ${idOrName} doesn't exist.`);
	return obj;
};

export type POHBoosts = Partial<Record<PoHSlot, Record<string, number>>>;

export function calcPOHBoosts(poh: PlayerOwnedHouse, boosts: POHBoosts) {
	let boost = 0;
	const messages = [];
	for (const [slot, objBoosts] of objectEntries(boosts)) {
		if (objBoosts === undefined) continue;
		for (const [name, boostPercent] of objectEntries(objBoosts)) {
			if (poh[slot] === getPOHObject(name).id) {
				messages.push(`${boostPercent}% for ${name}`);
				boost += boostPercent;
			}
		}
	}
	return { boost, messages };
}
