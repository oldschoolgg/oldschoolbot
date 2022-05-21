import { Item } from 'oldschooljs/dist/meta/types';

import DisassembleGroups from './groups';

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
	'corporeal',
	'crystal',
	'rocky',
	// Special
	'ethereal',
	'corporeal',
	'armadyl',
	'bandos',
	'saradomin',
	'zamorak',
	'third-age'
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

type DisassembleFlag = 'third_age' | 'dyed' | 'dwarven' | 'barrows' | 'abyssal';

interface IDisassembleFlag {
	name: string;
	flag: DisassembleFlag;
}

const disassembleFlags: IDisassembleFlag[] = [
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
console.log(disassembleFlags);

export interface DisassemblySourceGroup {
	name: string;
	items: {
		item: Item | Item[];
		lvl: number;
		junkChance?: number;
		partQuantity?: number;
		special?: { always: boolean; parts: SpecialDisassemblyGroup[] };
		flags?: DisassembleFlag[];
	}[];
	/**
	 * Percentage chances of what material you will get from this item.
	 */
	parts: IMaterialBank;
}

export const DisassemblySourceGroups = DisassembleGroups;
export const allItemsThatCanBeDisassembled = Array.from(
	new Set(DisassemblySourceGroups.map(i => i.items.map(i => i.item)).flat(2))
);
export const allItemsThatCanBeDisassembledIDs = new Set(allItemsThatCanBeDisassembled.map(i => i.id));
