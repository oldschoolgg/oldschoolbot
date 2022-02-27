import { Item } from 'oldschooljs/dist/meta/types';

import DisassembleGroups from './groups';

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
	'knightly',
	'corporeal',
	'crystal',
	'seren',
	'brassican',
	'harnessed',
	'historic',
	'classic',
	'timeworn',
	'vintage',
	// Custom
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

export interface SpecialDisassemblyGroup {
	type: MaterialType;
	chance: number;
	amount: number;
}

export interface DisassemblySourceGroup {
	name: string;
	items: {
		item: Item;
		lvl: number;
		junkChance?: number;
		special?: { always: boolean; parts: SpecialDisassemblyGroup[] };
	}[];
	parts: IMaterialBank;
	partQuantity: number;
}

export const DisassemblySourceGroups = DisassembleGroups;
export const allItemsThatCanBeDisassembled = Array.from(
	new Set(DisassemblySourceGroups.map(i => i.items.map(i => i.item)).flat(2))
);
export const allItemsThatCanBeDisassembledIDs = new Set(allItemsThatCanBeDisassembled.map(i => i.id));
