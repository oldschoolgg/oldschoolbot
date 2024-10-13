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
	expertCape?: Item;
}

const Skillcapes: Skillcape[] = [
	{
		skill: SkillsEnum.Mining,
		hood: itemID('Mining hood'),
		untrimmed: itemID('Mining cape'),
		trimmed: itemID('Mining cape(t)'),
		masterCape: getOSItem('Mining master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Smithing,
		hood: itemID('Smithing hood'),
		untrimmed: itemID('Smithing cape'),
		trimmed: itemID('Smithing cape(t)'),
		masterCape: getOSItem('Smithing master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Woodcutting,
		hood: itemID('Woodcutting hood'),
		untrimmed: itemID('Woodcutting cape'),
		trimmed: itemID('Woodcut. cape(t)'),
		masterCape: getOSItem('Woodcutting master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Firemaking,
		hood: itemID('Firemaking hood'),
		untrimmed: itemID('Firemaking cape'),
		trimmed: itemID('Firemaking cape(t)'),
		masterCape: getOSItem('Firemaking master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Agility,
		hood: itemID('Agility hood'),
		untrimmed: itemID('Agility cape'),
		trimmed: itemID('Agility cape(t)'),
		masterCape: getOSItem('Agility master cape'),
		expertCape: getOSItem('Support cape')
	},
	{
		skill: SkillsEnum.Fishing,
		hood: itemID('Fishing hood'),
		untrimmed: itemID('Fishing cape'),
		trimmed: itemID('Fishing cape(t)'),
		masterCape: getOSItem('Fishing master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Runecraft,
		hood: itemID('Runecraft hood'),
		untrimmed: itemID('Runecraft cape'),
		trimmed: itemID('Runecraft cape(t)'),
		masterCape: getOSItem('Runecraft master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Cooking,
		hood: itemID('Cooking hood'),
		untrimmed: itemID('Cooking cape'),
		trimmed: itemID('Cooking cape(t)'),
		masterCape: getOSItem('Cooking master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Crafting,
		hood: itemID('Crafting hood'),
		untrimmed: itemID('Crafting cape'),
		trimmed: itemID('Crafting cape(t)'),
		masterCape: getOSItem('Crafting master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Prayer,
		hood: itemID('Prayer hood'),
		untrimmed: itemID('Prayer cape'),
		trimmed: itemID('Prayer cape(t)'),
		masterCape: getOSItem('Prayer master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Fletching,
		hood: itemID('Fletching hood'),
		untrimmed: itemID('Fletching cape'),
		trimmed: itemID('Fletching cape(t)'),
		masterCape: getOSItem('Fletching master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Thieving,
		hood: itemID('Thieving hood'),
		untrimmed: itemID('Thieving cape'),
		trimmed: itemID('Thieving cape(t)'),
		masterCape: getOSItem('Thieving master cape'),
		expertCape: getOSItem('Support cape')
	},
	{
		skill: SkillsEnum.Farming,
		hood: itemID('Farming hood'),
		untrimmed: itemID('Farming cape'),
		trimmed: itemID('Farming cape(t)'),
		masterCape: getOSItem('Farming master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Herblore,
		hood: itemID('Herblore hood'),
		untrimmed: itemID('Herblore cape'),
		trimmed: itemID('Herblore cape(t)'),
		masterCape: getOSItem('Herblore master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Hunter,
		hood: itemID('Hunter hood'),
		untrimmed: itemID('Hunter cape'),
		trimmed: itemID('Hunter cape(t)'),
		masterCape: getOSItem('Hunter master cape'),
		expertCape: getOSItem("Gatherer's cape")
	},
	{
		skill: SkillsEnum.Construction,
		hood: itemID('Construct. hood'),
		untrimmed: itemID('Construct. cape'),
		trimmed: itemID('Construct. cape(t)'),
		masterCape: getOSItem('Construction master cape'),
		expertCape: getOSItem("Artisan's cape")
	},
	{
		skill: SkillsEnum.Magic,
		hood: itemID('Magic hood'),
		untrimmed: itemID('Magic cape'),
		trimmed: itemID('Magic cape(t)'),
		masterCape: getOSItem('Magic master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Attack,
		hood: itemID('Attack hood'),
		untrimmed: itemID('Attack cape'),
		trimmed: itemID('Attack cape(t)'),
		masterCape: getOSItem('Attack master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Strength,
		hood: itemID('Strength hood'),
		untrimmed: itemID('Strength cape'),
		trimmed: itemID('Strength cape(t)'),
		masterCape: getOSItem('Strength master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Defence,
		hood: itemID('Defence hood'),
		untrimmed: itemID('Defence cape'),
		trimmed: itemID('Defence cape(t)'),
		masterCape: getOSItem('Defence master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Ranged,
		hood: itemID('Ranging hood'),
		untrimmed: itemID('Ranging cape'),
		trimmed: itemID('Ranging cape(t)'),
		masterCape: getOSItem('Ranged master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Hitpoints,
		hood: itemID('Hitpoints hood'),
		untrimmed: itemID('Hitpoints cape'),
		trimmed: itemID('Hitpoints cape(t)'),
		masterCape: getOSItem('Hitpoints master cape'),
		expertCape: getOSItem("Combatant's cape")
	},
	{
		skill: SkillsEnum.Slayer,
		hood: itemID('Slayer hood'),
		untrimmed: itemID('Slayer cape'),
		trimmed: itemID('Slayer cape(t)'),
		masterCape: getOSItem('Slayer master cape'),
		expertCape: getOSItem('Support cape')
	},
	{
		skill: SkillsEnum.Dungeoneering,
		hood: itemID('Dungeoneering hood'),
		untrimmed: itemID('Dungeoneering cape'),
		trimmed: itemID('Dungeoneering cape(t)'),
		masterCape: getOSItem('Dungeoneering master cape'),
		expertCape: getOSItem('Support cape')
	},
	{
		skill: SkillsEnum.Invention,
		hood: itemID('Invention hood'),
		untrimmed: itemID('Invention cape'),
		trimmed: itemID('Invention cape(t)'),
		masterCape: getOSItem('Invention master cape')
		// No expert cape for Invention
	},
	{
		skill: SkillsEnum.Divination,
		hood: itemID('Divination hood'),
		untrimmed: itemID('Divination cape'),
		trimmed: itemID('Divination cape(t)'),
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
