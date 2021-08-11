import LootTable from 'oldschooljs/dist/structures/LootTable';

import { SkillsEnum } from './skilling/types';
import itemID from './util/itemID';

export interface XPLamp {
	itemID: number;
	amount?: number;
	amountFn?: (_skill: SkillsEnum, _level: number) => number;
	name: string;
}

const darkRelicBoostSkills: SkillsEnum[] = [
	SkillsEnum.Mining,
	SkillsEnum.Woodcutting,
	SkillsEnum.Herblore,
	SkillsEnum.Fishing,
	SkillsEnum.Hunter,
	SkillsEnum.Cooking,
	SkillsEnum.Farming,
	SkillsEnum.Thieving,
	SkillsEnum.Firemaking,
	SkillsEnum.Agility
];

export const XPLamps: XPLamp[] = [
	// Achievement diary lamps
	{
		itemID: 11_137,
		amount: 2500,
		name: 'Antique lamp 1'
	},
	{
		itemID: 11_139,
		amount: 7500,
		name: 'Antique lamp 2'
	},
	{
		itemID: 11_141,
		amount: 15_000,
		name: 'Antique lamp 3'
	},
	{
		itemID: 11_185,
		amount: 50_000,
		name: 'Antique lamp 4'
	},
	// BSO Lamps
	{
		itemID: 6796,
		amount: 20_000,
		name: 'Tiny lamp'
	},
	{
		itemID: 21_642,
		amount: 50_000,
		name: 'Small lamp'
	},
	{
		itemID: 23_516,
		amount: 100_000,
		name: 'Average lamp'
	},
	{
		itemID: 22_320,
		amount: 1_000_000,
		name: 'Large lamp'
	},
	{
		itemID: 11_157,
		amount: 5_000_000,
		name: 'Huge lamp'
	},
	{
		itemID: itemID('Dark relic'),
		amountFn: (skill, level) => {
			return darkRelicBoostSkills.includes(skill) ? level * 150 : level * 50;
		},
		name: 'Dark relic'
	}
];

export const LampTable = new LootTable()
	.add(6796, 1, 40)
	.add(21_642, 1, 30)
	.add(23_516, 1, 20)
	.add(22_320, 1, 5)
	.add(11_157, 1, 1);
