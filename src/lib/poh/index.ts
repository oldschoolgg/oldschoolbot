import { Bank } from 'oldschooljs';

import { LevelRequirements } from '../skilling/types';
import { DungeonDecorations } from './objects/dungeon_decorations';
import { Guards } from './objects/guards';
import { JewelleryBoxes } from './objects/jewellery_boxes';
import { MountedCapes } from './objects/mounted_capes';
import { MountedFish } from './objects/mounted_fish';
import { MountedHeads } from './objects/mounted_heads';
import { Pools } from './objects/pools';
import { PrayerAltars } from './objects/prayer_altars';
import { Prisons } from './objects/prisons';
import { SpellbookAltars } from './objects/spellbook_altars';
import { Teleports } from './objects/teleports';
import { Thrones } from './objects/thrones';
import { Torches } from './objects/torches';

export interface PoH {
	background: 1;
	throne: number | null;
	pool: number | null;
	mountedCape: number | null;
	mountedFish: number | null;
	jewelleryBox: number | null;
	prayerAltar: number | null;
	spellbookAltar: number | null;
	mountedHead: number | null;
	teleport: number | null;

	torch: number | null;
	guard: number | null;
	dungeonDecoration: number | null;
	prison: number | null;
}

const HOUSE_WIDTH = 585;
const TOP_FLOOR_Y = 118;
const GROUND_FLOOR_Y = 236;
const DUNGEON_FLOOR_Y = 351;
const FLOOR_HEIGHT = 112;
const GARDEN_X = 587;
const GARDEN_Y = 236;

type PoHSlot = keyof Omit<PoH, 'background'>;

export interface PoHObject {
	id: number;
	name: string;
	requiredInPlace?: number;
	itemCost?: Bank;
	slot: PoHSlot;
	level: number | LevelRequirements;
	refundItems?: boolean;
}

export const Placeholders: Record<PoHSlot, [number, [number, number][]]> = {
	mountedHead: [15382, [[350, GROUND_FLOOR_Y - 60]]],
	mountedFish: [15383, [[240, GROUND_FLOOR_Y - 70]]],

	throne: [15426, [[HOUSE_WIDTH / 2, GROUND_FLOOR_Y]]],
	mountedCape: [29144, [[220, GROUND_FLOOR_Y]]],
	jewelleryBox: [29142, [[369, GROUND_FLOOR_Y]]],
	prayerAltar: [15270, [[175, TOP_FLOOR_Y]]],
	spellbookAltar: [29140, [[60, TOP_FLOOR_Y]]],

	// Dungeon
	guard: [15323, [[350, DUNGEON_FLOOR_Y]]],
	torch: [
		15330,
		[
			[50, DUNGEON_FLOOR_Y - FLOOR_HEIGHT / 2],
			[HOUSE_WIDTH - 50, DUNGEON_FLOOR_Y - FLOOR_HEIGHT / 2]
		]
	],
	dungeonDecoration: [15331, [[100, DUNGEON_FLOOR_Y]]],
	prison: [15352, [[100, DUNGEON_FLOOR_Y]]],

	// Garden
	pool: [29122, [[GARDEN_X + HOUSE_WIDTH / 6, GARDEN_Y]]],
	teleport: [29120, [[GARDEN_X + HOUSE_WIDTH / 2, GARDEN_Y]]]
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
	Prisons
};

export const PoHObjects = Object.values(GroupedPohObjects).flat(Infinity) as PoHObject[];

export const getPOHObject = (id: number) => {
	let obj = PoHObjects.find(i => i.id === id);
	if (!obj) throw new Error(`POH Object with id ${id} doesn't exist.`);
	return obj;
};
