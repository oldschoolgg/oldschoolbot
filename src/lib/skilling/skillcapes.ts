import { type Item, Items, itemID } from 'oldschooljs';

import { SkillsEnum } from '@/lib/skilling/types.js';

interface Skillcape {
	skill: SkillsEnum;
	hood: number;
	untrimmed: number;
	trimmed: number;
	masterCape: Item;
	masterCapeInverted: Item;
	expertCape?: Item;
}

const Skillcapes: Skillcape[] = [
	{
		skill: SkillsEnum.Mining,
		hood: itemID('Mining hood'),
		untrimmed: itemID('Mining cape'),
		trimmed: itemID('Mining cape(t)'),
		masterCape: Items.getOrThrow('Mining master cape'),
		masterCapeInverted: Items.getOrThrow('Mining master cape (inverted)'),
		expertCape: Items.getOrThrow("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Smithing,
		hood: itemID('Smithing hood'),
		untrimmed: itemID('Smithing cape'),
		trimmed: itemID('Smithing cape(t)'),
		masterCape: Items.getOrThrow('Smithing master cape'),
		masterCapeInverted: Items.getOrThrow('Smithing master cape (inverted)'),
		expertCape: Items.getOrThrow("Artisan's cape")
	},
	{
		skill: SkillsEnum.Woodcutting,
		hood: itemID('Woodcutting hood'),
		untrimmed: itemID('Woodcutting cape'),
		trimmed: itemID('Woodcut. cape(t)'),
		masterCapeInverted: Items.getOrThrow('Woodcutting master cape (inverted)'),
		masterCape: Items.getOrThrow('Woodcutting master cape'),
		expertCape: Items.getOrThrow("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Firemaking,
		hood: itemID('Firemaking hood'),
		untrimmed: itemID('Firemaking cape'),
		trimmed: itemID('Firemaking cape(t)'),
		masterCapeInverted: Items.getOrThrow('Firemaking master cape (inverted)'),
		masterCape: Items.getOrThrow('Firemaking master cape'),
		expertCape: Items.getOrThrow("Artisan's cape")
	},
	{
		skill: SkillsEnum.Agility,
		hood: itemID('Agility hood'),
		untrimmed: itemID('Agility cape'),
		trimmed: itemID('Agility cape(t)'),
		masterCapeInverted: Items.getOrThrow('Agility master cape (inverted)'),
		masterCape: Items.getOrThrow('Agility master cape'),
		expertCape: Items.getOrThrow('Support cape')
	},
	{
		skill: SkillsEnum.Fishing,
		hood: itemID('Fishing hood'),
		untrimmed: itemID('Fishing cape'),
		trimmed: itemID('Fishing cape(t)'),
		masterCapeInverted: Items.getOrThrow('Fishing master cape (inverted)'),
		masterCape: Items.getOrThrow('Fishing master cape'),
		expertCape: Items.getOrThrow("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Runecraft,
		hood: itemID('Runecraft hood'),
		untrimmed: itemID('Runecraft cape'),
		trimmed: itemID('Runecraft cape(t)'),
		masterCapeInverted: Items.getOrThrow('Runecraft master cape (inverted)'),
		masterCape: Items.getOrThrow('Runecraft master cape'),
		expertCape: Items.getOrThrow("Artisan's cape")
	},
	{
		skill: SkillsEnum.Cooking,
		hood: itemID('Cooking hood'),
		untrimmed: itemID('Cooking cape'),
		trimmed: itemID('Cooking cape(t)'),
		masterCapeInverted: Items.getOrThrow('Cooking master cape (inverted)'),
		masterCape: Items.getOrThrow('Cooking master cape'),
		expertCape: Items.getOrThrow("Artisan's cape")
	},
	{
		skill: SkillsEnum.Crafting,
		hood: itemID('Crafting hood'),
		untrimmed: itemID('Crafting cape'),
		trimmed: itemID('Crafting cape(t)'),
		masterCapeInverted: Items.getOrThrow('Crafting master cape (inverted)'),
		masterCape: Items.getOrThrow('Crafting master cape'),
		expertCape: Items.getOrThrow("Artisan's cape")
	},
	{
		skill: SkillsEnum.Prayer,
		hood: itemID('Prayer hood'),
		untrimmed: itemID('Prayer cape'),
		trimmed: itemID('Prayer cape(t)'),
		masterCapeInverted: Items.getOrThrow('Prayer master cape (inverted)'),
		masterCape: Items.getOrThrow('Prayer master cape'),
		expertCape: Items.getOrThrow("Combatant's cape")
	},
	{
		skill: SkillsEnum.Fletching,
		hood: itemID('Fletching hood'),
		untrimmed: itemID('Fletching cape'),
		trimmed: itemID('Fletching cape(t)'),
		masterCapeInverted: Items.getOrThrow('Fletching master cape (inverted)'),
		masterCape: Items.getOrThrow('Fletching master cape'),
		expertCape: Items.getOrThrow("Artisan's cape")
	},
	{
		skill: SkillsEnum.Thieving,
		hood: itemID('Thieving hood'),
		untrimmed: itemID('Thieving cape'),
		trimmed: itemID('Thieving cape(t)'),
		masterCapeInverted: Items.getOrThrow('Thieving master cape (inverted)'),
		masterCape: Items.getOrThrow('Thieving master cape'),
		expertCape: Items.getOrThrow('Support cape')
	},
	{
		skill: SkillsEnum.Farming,
		hood: itemID('Farming hood'),
		untrimmed: itemID('Farming cape'),
		trimmed: itemID('Farming cape(t)'),
		masterCapeInverted: Items.getOrThrow('Farming master cape (inverted)'),
		masterCape: Items.getOrThrow('Farming master cape'),
		expertCape: Items.getOrThrow("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Herblore,
		hood: itemID('Herblore hood'),
		untrimmed: itemID('Herblore cape'),
		trimmed: itemID('Herblore cape(t)'),
		masterCapeInverted: Items.getOrThrow('Herblore master cape (inverted)'),
		masterCape: Items.getOrThrow('Herblore master cape'),
		expertCape: Items.getOrThrow("Artisan's cape")
	},
	{
		skill: SkillsEnum.Hunter,
		hood: itemID('Hunter hood'),
		untrimmed: itemID('Hunter cape'),
		trimmed: itemID('Hunter cape(t)'),
		masterCapeInverted: Items.getOrThrow('Hunter master cape (inverted)'),
		masterCape: Items.getOrThrow('Hunter master cape'),
		expertCape: Items.getOrThrow("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Construction,
		hood: itemID('Construct. hood'),
		untrimmed: itemID('Construct. cape'),
		trimmed: itemID('Construct. cape(t)'),
		masterCapeInverted: Items.getOrThrow('Construction master cape (inverted)'),
		masterCape: Items.getOrThrow('Construction master cape'),
		expertCape: Items.getOrThrow("Artisan's cape")
	},
	{
		skill: SkillsEnum.Magic,
		hood: itemID('Magic hood'),
		untrimmed: itemID('Magic cape'),
		trimmed: itemID('Magic cape(t)'),
		masterCapeInverted: Items.getOrThrow('Magic master cape (inverted)'),
		masterCape: Items.getOrThrow('Magic master cape'),
		expertCape: Items.getOrThrow("Combatant's cape")
	},
	{
		skill: SkillsEnum.Attack,
		hood: itemID('Attack hood'),
		untrimmed: itemID('Attack cape'),
		trimmed: itemID('Attack cape(t)'),
		masterCapeInverted: Items.getOrThrow('Attack master cape (inverted)'),
		masterCape: Items.getOrThrow('Attack master cape'),
		expertCape: Items.getOrThrow("Combatant's cape")
	},
	{
		skill: SkillsEnum.Strength,
		hood: itemID('Strength hood'),
		untrimmed: itemID('Strength cape'),
		trimmed: itemID('Strength cape(t)'),
		masterCapeInverted: Items.getOrThrow('Strength master cape (inverted)'),
		masterCape: Items.getOrThrow('Strength master cape'),
		expertCape: Items.getOrThrow("Combatant's cape")
	},
	{
		skill: SkillsEnum.Defence,
		hood: itemID('Defence hood'),
		untrimmed: itemID('Defence cape'),
		trimmed: itemID('Defence cape(t)'),
		masterCapeInverted: Items.getOrThrow('Defence master cape (inverted)'),
		masterCape: Items.getOrThrow('Defence master cape'),
		expertCape: Items.getOrThrow("Combatant's cape")
	},
	{
		skill: SkillsEnum.Ranged,
		hood: itemID('Ranging hood'),
		untrimmed: itemID('Ranging cape'),
		trimmed: itemID('Ranging cape(t)'),
		masterCapeInverted: Items.getOrThrow('Ranging master cape (inverted)'),
		masterCape: Items.getOrThrow('Ranged master cape'),
		expertCape: Items.getOrThrow("Combatant's cape")
	},
	{
		skill: SkillsEnum.Hitpoints,
		hood: itemID('Hitpoints hood'),
		untrimmed: itemID('Hitpoints cape'),
		trimmed: itemID('Hitpoints cape(t)'),
		masterCapeInverted: Items.getOrThrow('Hitpoints master cape (inverted)'),
		masterCape: Items.getOrThrow('Hitpoints master cape'),
		expertCape: Items.getOrThrow("Combatant's cape")
	},
	{
		skill: SkillsEnum.Slayer,
		hood: itemID('Slayer hood'),
		untrimmed: itemID('Slayer cape'),
		trimmed: itemID('Slayer cape(t)'),
		masterCapeInverted: Items.getOrThrow('Slayer master cape (inverted)'),
		masterCape: Items.getOrThrow('Slayer master cape'),
		expertCape: Items.getOrThrow('Support cape')
	},
	{
		skill: SkillsEnum.Dungeoneering,
		hood: itemID('Dungeoneering hood'),
		untrimmed: itemID('Dungeoneering cape'),
		trimmed: itemID('Dungeoneering cape(t)'),
		masterCapeInverted: Items.getOrThrow('Dungeoneering master cape (inverted)'),
		masterCape: Items.getOrThrow('Dungeoneering master cape'),
		expertCape: Items.getOrThrow('Support cape')
	},
	{
		skill: SkillsEnum.Invention,
		hood: itemID('Invention hood'),
		untrimmed: itemID('Invention cape'),
		trimmed: itemID('Invention cape(t)'),
		masterCapeInverted: Items.getOrThrow('Invention master cape (inverted)'),
		masterCape: Items.getOrThrow('Invention master cape')
		// No expert cape for Invention
	},
	{
		skill: SkillsEnum.Divination,
		hood: itemID('Divination hood'),
		untrimmed: itemID('Divination cape'),
		trimmed: itemID('Divination cape(t)'),
		masterCapeInverted: Items.getOrThrow('Divination master cape (inverted)'),
		masterCape: Items.getOrThrow('Divination master cape'),
		expertCape: Items.getOrThrow("Gatherer's cape")
	}
];

export default Skillcapes;
