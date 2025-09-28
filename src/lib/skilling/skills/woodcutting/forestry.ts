import { LootTable } from 'oldschooljs';

import type { SkillNameType } from '@/lib/skilling/types.js';

export const LeafTable = new LootTable()
	.add('Leaves', 20)
	.add('Oak leaves', 20)
	.add('Willow leaves', 20)
	.add('Maple leaves', 20)
	.add('Yew leaves', 20)
	.add('Magic leaves', 20);

interface ForestryEvent {
	id: number;
	name: string;
	uniqueXP: SkillNameType;
}

export const ForestryEvents: ForestryEvent[] = [
	{
		id: 1,
		name: 'Rising Roots',
		uniqueXP: 'woodcutting'
	},
	{
		id: 2,
		name: 'Struggling Sapling',
		uniqueXP: 'farming'
	},
	{
		id: 3,
		name: 'Flowering Bush',
		uniqueXP: 'woodcutting'
	},
	{
		id: 4,
		name: 'Woodcutting Leprechaun',
		uniqueXP: 'woodcutting'
	},
	{
		id: 5,
		name: 'Beehive',
		uniqueXP: 'construction'
	},
	{
		id: 6,
		name: 'Friendly Ent',
		uniqueXP: 'fletching'
	},
	{
		id: 7,
		name: 'Poachers',
		uniqueXP: 'hunter'
	},
	{
		id: 8,
		name: 'Enchantment Ritual',
		uniqueXP: 'woodcutting'
	},
	{
		id: 9,
		name: 'Pheasant Control',
		uniqueXP: 'thieving'
	}
];
