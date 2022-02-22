import { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from '../util/getOSItem';

const i = getOSItem;

const materialTypes = [
	'junk',
	'simple',
	'living',
	'head',
	'blade',
	'smooth',
	'sharp',
	'direct',
	'stave',
	'crafted',
	'precise',
	'spiked',
	'swift',
	'magic',
	'powerful',
	'base',
	'stunning',
	'imbued',
	'tensile',
	'flexible',
	'strong',
	'cover',
	'deflecting',
	'protective',
	'heavy',
	'evasive',
	'clear',
	'delicate',
	'precious',
	'light',
	'faceted',
	'padded',
	'plated',
	'connector',
	'dextrous',
	'metallic',
	'organic',
	'healthy',
	'enhancing',
	'subtle',
	'pious',
	'variable',
	'ethereal',
	'clockwork',
	'dragonfire',
	'explosive',
	'corporeal',
	'armadyl',
	'bandos',
	'saradomin',
	'zamorak',
	'zaros',
	'resilient',
	'rumbling',
	'pestiferous',
	'third-age',
	'culinary',
	'shifting',
	'undead',
	'fortunate',
	//
	'rocky'
] as const;

export type MaterialType = typeof materialTypes[number];

// interface ItemSource {
// name: MaterialType;
// typeWeightings: SimpleTable<MaterialType>;
// items: { item: Item; level: number }[];
// }

// interface ItemSource {
// name: MaterialType;
// typeWeightings: SimpleTable<MaterialType>;
// items: { item: Item; level: number }[];
// }
export type IMaterialBank = {
	[key in MaterialType]?: number;
};
export interface SingleMaterial {
	material: MaterialType;
	quantity: number;
}

export interface DissassemblySourceGroup {
	name: string;
	items: { item: Item; lvl: number; junkChance?: number }[];
	parts: IMaterialBank;
}

const Misc: DissassemblySourceGroup = {
	name: 'Misc',
	items: [
		{ item: i('Rune essence'), lvl: 1, junkChance: 99 },
		{ item: i('Pure essence'), lvl: 20, junkChance: 80 },
		{ item: i('Soft clay'), lvl: 20 }
	],
	parts: {
		simple: 99,
		variable: 1
	}
};

const Ores: DissassemblySourceGroup = {
	name: 'Ores',
	items: [
		{ item: i('Copper ore'), lvl: 1 },
		{ item: i('Tin ore'), lvl: 1 },
		{ item: i('Iron ore'), lvl: 15 },
		{ item: i('Silver ore'), lvl: 20 },
		{ item: i('Coal'), lvl: 30 },
		{ item: i('Gold ore'), lvl: 40 },
		{ item: i('Mithril ore'), lvl: 55 },
		{ item: i('Adamantite ore'), lvl: 70 },
		{ item: i('Runite ore'), lvl: 85 }
	],
	parts: {
		rocky: 70,
		simple: 30
	}
};

export const DissassemblySourceGroups = [Ores, Misc];
export const allItemsThatCanBeDisassembled = Array.from(
	new Set(DissassemblySourceGroups.map(i => i.items.map(i => i.item)).flat(2))
);
export const allItemsThatCanBeDisassembledIDs = new Set(allItemsThatCanBeDisassembled.map(i => i.id));
