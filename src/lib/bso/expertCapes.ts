import { type Item, Items, resolveItems } from 'oldschooljs';

import type { SkillNameType } from '@/lib/skilling/types.js';

interface ExpertCapeSource {
	cape: Item;
	requiredItems: number[];
	skills: SkillNameType[];
}

export const expertCapesSource: ExpertCapeSource[] = [
	{
		cape: Items.getOrThrow('Support cape'),
		requiredItems: resolveItems([
			'Agility master cape',
			'Dungeoneering master cape',
			'Thieving master cape',
			'Slayer master cape'
		]),
		skills: ['slayer', 'agility', 'dungeoneering', 'thieving']
	},
	{
		cape: Items.getOrThrow("Gatherer's cape"),
		requiredItems: resolveItems([
			'Farming master cape',
			'Fishing master cape',
			'Hunter master cape',
			'Mining master cape',
			'Woodcutting master cape',
			'Divination master cape'
		]),
		skills: ['farming', 'fishing', 'hunter', 'mining', 'woodcutting', 'divination']
	},
	{
		cape: Items.getOrThrow("Combatant's cape"),
		requiredItems: resolveItems([
			'Attack master cape',
			'Hitpoints master cape',
			'Defence master cape',
			'Magic master cape',
			'Prayer master cape',
			'Ranged master cape',
			'Strength master cape'
		]),
		skills: ['attack', 'hitpoints', 'defence', 'magic', 'prayer', 'ranged', 'strength']
	},
	{
		cape: Items.getOrThrow("Artisan's cape"),
		requiredItems: resolveItems([
			'Crafting master cape',
			'Construction master cape',
			'Cooking master cape',
			'Firemaking master cape',
			'Fletching master cape',
			'Herblore master cape',
			'Runecraft master cape',
			'Smithing master cape'
		]),
		skills: ['crafting', 'construction', 'cooking', 'firemaking', 'fletching', 'herblore', 'runecraft', 'smithing']
	}
];
