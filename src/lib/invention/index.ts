import { Item } from 'oldschooljs/dist/meta/types';

import { DisassemblySourceGroups } from './groups';

export const materialTypes = [
	'junk',
	'simple',
	'base',
	'smooth',
	'sharp',
	'swift',
	'magic',
	'powerful',
	'imbued',
	'flexible',
	'strong',
	'protective',
	'heavy',
	'precious',
	'plated',
	'dextrous',
	'metallic',
	'organic',
	'pious',
	'crystal',
	'rocky',
	// Special
	'corporeal',
	'third-age',
	'mysterious',
	'barrows',
	'abyssal',
	'dwarven',
	'treasured',
	'drygore',
	'gilded'
] as const;

export type MaterialType = typeof materialTypes[number];

export type IMaterialBank = {
	[key in MaterialType]?: number;
};
export interface SingleMaterial {
	material: MaterialType;
	quantity: number;
}

export type DisassembleFlag =
	| 'third_age'
	| 'dyed'
	| 'dwarven'
	| 'barrows'
	| 'abyssal'
	| 'corporeal'
	| 'treasure_trails'
	| 'mystery_box';

interface IDisassembleFlag {
	name: string;
	flag: DisassembleFlag;
}

export const disassembleFlags: IDisassembleFlag[] = [
	{
		name: 'Third Age',
		flag: 'third_age'
	},
	{
		name: 'Dyed',
		flag: 'dyed'
	},
	{
		name: 'Dwarven',
		flag: 'dwarven'
	},
	{
		name: 'Barrows',
		flag: 'barrows'
	}
];

export interface DisassemblyItem {
	item: Item | Item[];
	lvl: number;
	flags?: Set<DisassembleFlag>;
	outputMultiplier?: number;
}

export interface DisassemblySourceGroup {
	name: string;
	description?: string;
	items: DisassemblyItem[];
	/**
	 * Percentage chances of what material you will get from this item.
	 */
	parts: IMaterialBank;
}

export const allItemsThatCanBeDisassembled = Array.from(
	new Set(DisassemblySourceGroups.map(i => i.items.map(i => i.item)).flat(2))
);
export const allItemsThatCanBeDisassembledIDs = new Set(allItemsThatCanBeDisassembled.map(i => i.id));
