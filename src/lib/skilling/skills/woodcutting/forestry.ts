import { LootTable } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

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
	uniqueXP: SkillsEnum;
}

export const ForestryEvents: ForestryEvent[] = [
	{
		id: 1,
		name: 'Rising Roots',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 2,
		name: 'Struggling Sapling',
		uniqueXP: SkillsEnum.Farming
	},
	{
		id: 3,
		name: 'Flowering Bush',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 4,
		name: 'Woodcutting Leprechaun',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 5,
		name: 'Beehive',
		uniqueXP: SkillsEnum.Construction
	},
	{
		id: 6,
		name: 'Friendly Ent',
		uniqueXP: SkillsEnum.Fletching
	},
	{
		id: 7,
		name: 'Poachers',
		uniqueXP: SkillsEnum.Hunter
	},
	{
		id: 8,
		name: 'Enchantment Ritual',
		uniqueXP: SkillsEnum.Woodcutting
	},
	{
		id: 9,
		name: 'Pheasant Control',
		uniqueXP: SkillsEnum.Thieving
	}
];
