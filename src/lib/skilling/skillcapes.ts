import { Bank } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from '../util/getOSItem';
import itemID from '../util/itemID';
import { SkillsEnum } from './types';

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
		masterCape: getOSItem('Mining master cape'),
		masterCapeInverted: getOSItem('Mining master cape (inverted)'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Smithing,
		hood: itemID('Smithing hood'),
		untrimmed: itemID('Smithing cape'),
		trimmed: itemID('Smithing cape(t)'),
		masterCape: getOSItem('Smithing master cape'),
		masterCapeInverted: getOSItem('Smithing master cape (inverted)'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Woodcutting,
		hood: itemID('Woodcutting hood'),
		untrimmed: itemID('Woodcutting cape'),
		trimmed: itemID('Woodcut. cape(t)'),
		masterCapeInverted: getOSItem('Woodcutting master cape (inverted)'),
		masterCape: getOSItem('Woodcutting master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Firemaking,
		hood: itemID('Firemaking hood'),
		untrimmed: itemID('Firemaking cape'),
		trimmed: itemID('Firemaking cape(t)'),
		masterCapeInverted: getOSItem('Firemaking master cape (inverted)'),
		masterCape: getOSItem('Firemaking master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Agility,
		hood: itemID('Agility hood'),
		untrimmed: itemID('Agility cape'),
		trimmed: itemID('Agility cape(t)'),
		masterCapeInverted: getOSItem('Agility master cape (inverted)'),
		masterCape: getOSItem('Agility master cape'),
		expertCape: getOSItem('Support cape')
	},
	{
		skill: SkillsEnum.Fishing,
		hood: itemID('Fishing hood'),
		untrimmed: itemID('Fishing cape'),
		trimmed: itemID('Fishing cape(t)'),
		masterCapeInverted: getOSItem('Fishing master cape (inverted)'),
		masterCape: getOSItem('Fishing master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Runecraft,
		hood: itemID('Runecraft hood'),
		untrimmed: itemID('Runecraft cape'),
		trimmed: itemID('Runecraft cape(t)'),
		masterCapeInverted: getOSItem('Runecraft master cape (inverted)'),
		masterCape: getOSItem('Runecraft master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Cooking,
		hood: itemID('Cooking hood'),
		untrimmed: itemID('Cooking cape'),
		trimmed: itemID('Cooking cape(t)'),
		masterCapeInverted: getOSItem('Cooking master cape (inverted)'),
		masterCape: getOSItem('Cooking master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Crafting,
		hood: itemID('Crafting hood'),
		untrimmed: itemID('Crafting cape'),
		trimmed: itemID('Crafting cape(t)'),
		masterCapeInverted: getOSItem('Crafting master cape (inverted)'),
		masterCape: getOSItem('Crafting master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Prayer,
		hood: itemID('Prayer hood'),
		untrimmed: itemID('Prayer cape'),
		trimmed: itemID('Prayer cape(t)'),
		masterCapeInverted: getOSItem('Prayer master cape (inverted)'),
		masterCape: getOSItem('Prayer master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Fletching,
		hood: itemID('Fletching hood'),
		untrimmed: itemID('Fletching cape'),
		trimmed: itemID('Fletching cape(t)'),
		masterCapeInverted: getOSItem('Fletching master cape (inverted)'),
		masterCape: getOSItem('Fletching master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Thieving,
		hood: itemID('Thieving hood'),
		untrimmed: itemID('Thieving cape'),
		trimmed: itemID('Thieving cape(t)'),
		masterCapeInverted: getOSItem('Thieving master cape (inverted)'),
		masterCape: getOSItem('Thieving master cape'),
		expertCape: getOSItem('Support cape')
	},
	{
		skill: SkillsEnum.Farming,
		hood: itemID('Farming hood'),
		untrimmed: itemID('Farming cape'),
		trimmed: itemID('Farming cape(t)'),
		masterCapeInverted: getOSItem('Farming master cape (inverted)'),
		masterCape: getOSItem('Farming master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Herblore,
		hood: itemID('Herblore hood'),
		untrimmed: itemID('Herblore cape'),
		trimmed: itemID('Herblore cape(t)'),
		masterCapeInverted: getOSItem('Herblore master cape (inverted)'),
		masterCape: getOSItem('Herblore master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Hunter,
		hood: itemID('Hunter hood'),
		untrimmed: itemID('Hunter cape'),
		trimmed: itemID('Hunter cape(t)'),
		masterCapeInverted: getOSItem('Hunter master cape (inverted)'),
		masterCape: getOSItem('Hunter master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Construction,
		hood: itemID('Construct. hood'),
		untrimmed: itemID('Construct. cape'),
		trimmed: itemID('Construct. cape(t)'),
		masterCapeInverted: getOSItem('Construction master cape (inverted)'),
		masterCape: getOSItem('Construction master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Magic,
		hood: itemID('Magic hood'),
		untrimmed: itemID('Magic cape'),
		trimmed: itemID('Magic cape(t)'),
		masterCapeInverted: getOSItem('Magic master cape (inverted)'),
		masterCape: getOSItem('Magic master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Attack,
		hood: itemID('Attack hood'),
		untrimmed: itemID('Attack cape'),
		trimmed: itemID('Attack cape(t)'),
		masterCapeInverted: getOSItem('Attack master cape (inverted)'),
		masterCape: getOSItem('Attack master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Strength,
		hood: itemID('Strength hood'),
		untrimmed: itemID('Strength cape'),
		trimmed: itemID('Strength cape(t)'),
		masterCapeInverted: getOSItem('Strength master cape (inverted)'),
		masterCape: getOSItem('Strength master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Defence,
		hood: itemID('Defence hood'),
		untrimmed: itemID('Defence cape'),
		trimmed: itemID('Defence cape(t)'),
		masterCapeInverted: getOSItem('Defence master cape (inverted)'),
		masterCape: getOSItem('Defence master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Ranged,
		hood: itemID('Ranging hood'),
		untrimmed: itemID('Ranging cape'),
		trimmed: itemID('Ranging cape(t)'),
		masterCapeInverted: getOSItem('Ranging master cape (inverted)'),
		masterCape: getOSItem('Ranged master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Hitpoints,
		hood: itemID('Hitpoints hood'),
		untrimmed: itemID('Hitpoints cape'),
		trimmed: itemID('Hitpoints cape(t)'),
		masterCapeInverted: getOSItem('Hitpoints master cape (inverted)'),
		masterCape: getOSItem('Hitpoints master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Slayer,
		hood: itemID('Slayer hood'),
		untrimmed: itemID('Slayer cape'),
		trimmed: itemID('Slayer cape(t)'),
		masterCapeInverted: getOSItem('Slayer master cape (inverted)'),
		masterCape: getOSItem('Slayer master cape'),
		expertCape: getOSItem('Support cape')
	},
	{
		skill: SkillsEnum.Dungeoneering,
		hood: itemID('Dungeoneering hood'),
		untrimmed: itemID('Dungeoneering cape'),
		trimmed: itemID('Dungeoneering cape(t)'),
		masterCapeInverted: getOSItem('Dungeoneering master cape (inverted)'),
		masterCape: getOSItem('Dungeoneering master cape'),
		expertCape: getOSItem('Support cape')
	},
	{
		skill: SkillsEnum.Invention,
		hood: itemID('Invention hood'),
		untrimmed: itemID('Invention cape'),
		trimmed: itemID('Invention cape(t)'),
		masterCapeInverted: getOSItem('Invention master cape (inverted)'),
		masterCape: getOSItem('Invention master cape')
		// No expert cape for Invention
	},
	{
		skill: SkillsEnum.Divination,
		hood: itemID('Divination hood'),
		untrimmed: itemID('Divination cape'),
		trimmed: itemID('Divination cape(t)'),
		masterCapeInverted: getOSItem('Divination master cape (inverted)'),
		masterCape: getOSItem('Divination master cape'),
		expertCape: getOSItem("Gatherer's cape")
	}
];

export default Skillcapes;

export const compCapeCreatableBank = new Bank();
for (const cape of Skillcapes) {
	compCapeCreatableBank.add(cape.masterCape.id);
}
compCapeCreatableBank.add('Master quest cape');
compCapeCreatableBank.add('Achievement diary cape (t)');
compCapeCreatableBank.add('Music cape (t)');

compCapeCreatableBank.freeze();
