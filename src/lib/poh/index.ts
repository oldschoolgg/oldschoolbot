import { Bank } from 'oldschooljs';

import { LevelRequirements } from '../skilling/types';
import { Guards } from './objects/guards';
import { JewelleryBoxes } from './objects/jewellery_boxes';
import { MountedCapes } from './objects/mounted_capes';
import { MountedFish } from './objects/mounted_fish';
import { MountedHeads } from './objects/mounted_heads';
import { Pools } from './objects/pools';
import { PrayerAltars } from './objects/prayer_altars';
import { SpellbookAltars } from './objects/spellbook_altars';
import { Teleports } from './objects/teleports';
import { Thrones } from './objects/thrones';

export interface PoH {
	background: 1;
	altar: number | null;
	throne: number | null;
	pool: number | null;
	mountedCape: number | null;
	mountedFish: number | null;
	jewelleryBox: number | null;
	prayerAltar: number | null;
	spellbookAltar: number | null;
	mountedHead: number | null;
	guard: number | null;
	teleport: number | null;
}

const HOUSE_WIDTH = 585;
const TOP_FLOOR_Y = 118;
const GROUND_FLOOR_Y = 236;
const DUNGEON_FLOOR_Y = 351;

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
	gpCost?: number;
}

export const Placeholders: Record<PoHSlot, [number, [number, number]] | null> = {
	throne: [15426, [HOUSE_WIDTH / 2, GROUND_FLOOR_Y]],
	altar: null,
	mountedCape: [29144, [220, GROUND_FLOOR_Y]],
	jewelleryBox: [29142, [369, GROUND_FLOOR_Y]],
	prayerAltar: [15270, [175, TOP_FLOOR_Y]],
	spellbookAltar: [29140, [60, TOP_FLOOR_Y]],
	mountedFish: [15383, [200, TOP_FLOOR_Y - 60]],
	mountedHead: [15382, [410, TOP_FLOOR_Y - 55]],

	// Dungeon
	guard: [15323, [350, DUNGEON_FLOOR_Y]],

	// Garden
	pool: [29122, [GARDEN_X + HOUSE_WIDTH / 6, GARDEN_Y]],
	teleport: [29120, [GARDEN_X + HOUSE_WIDTH / 2, GARDEN_Y]]
};

export const PoHObjects = [
	...Thrones,
	...JewelleryBoxes,
	...MountedCapes,
	...PrayerAltars,
	...SpellbookAltars,
	...MountedFish,
	...MountedHeads,
	...Guards,
	...Pools,
	...Teleports
];
