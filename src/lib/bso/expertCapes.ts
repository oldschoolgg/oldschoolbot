import { resolveItems } from 'oldschooljs';

import { SkillsEnum } from '@/lib/skilling/types.js';

export const expertCapesSource = [
	{
		cape: Items.getOrThrow('Support cape'),
		requiredItems: resolveItems([
			'Agility master cape',
			'Dungeoneering master cape',
			'Thieving master cape',
			'Slayer master cape'
		]),
		skills: [SkillsEnum.Slayer, SkillsEnum.Agility, SkillsEnum.Dungeoneering, SkillsEnum.Thieving]
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
		skills: [
			SkillsEnum.Farming,
			SkillsEnum.Fishing,
			SkillsEnum.Hunter,
			SkillsEnum.Mining,
			SkillsEnum.Woodcutting,
			SkillsEnum.Divination
		]
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
		skills: [
			SkillsEnum.Attack,
			SkillsEnum.Hitpoints,
			SkillsEnum.Defence,
			SkillsEnum.Magic,
			SkillsEnum.Prayer,
			SkillsEnum.Ranged,
			SkillsEnum.Strength
		]
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
		skills: [
			SkillsEnum.Crafting,
			SkillsEnum.Construction,
			SkillsEnum.Cooking,
			SkillsEnum.Firemaking,
			SkillsEnum.Fletching,
			SkillsEnum.Herblore,
			SkillsEnum.Runecraft,
			SkillsEnum.Smithing
		]
	}
];
