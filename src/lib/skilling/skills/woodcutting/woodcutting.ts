import { LootTable } from 'oldschooljs';

import { Emoji } from '../../../constants';
import itemID from '../../../util/itemID';
import type { Log } from '../../types';
import { SkillsEnum } from '../../types';

const sulliuscepTable = new LootTable()
	.add('Numulite', [4, 8], 34)
	.add('Mushroom', 1, 58)
	.add('Mort myre fungus', 1, 7)
	.add('Sulliuscep cap', 1, 1)
	.oneIn(70, 'Unidentified small fossil')
	.oneIn(140, 'Unidentified medium fossil')
	.oneIn(175, 'Unidentified large fossil')
	.oneIn(700, 'Unidentified rare fossil');

const logs: Log[] = [
	{
		level: 1,
		xp: 25,
		id: itemID('Logs'),
		name: 'Logs',
		leaf: itemID('Leaves'),
		aliases: ['normal'],
		findNewTreeTime: 9,
		bankingTime: 20,
		slope: 0.54,
		intercept: 24.85,
		depletionChance: 100,
		wcGuild: true,
		petChance: 317_647,
		qpRequired: 0,
		clueScrollChance: 317_647
	},
	{
		level: 1,
		xp: 25,
		id: itemID('Achey tree logs'),
		name: 'Achey Tree Logs',
		findNewTreeTime: 8,
		bankingTime: 40,
		slope: 0.54,
		intercept: 24.85,
		depletionChance: 100,
		petChance: 317_647,
		qpRequired: 0,
		clueScrollChance: 317_647
	},
	{
		level: 15,
		xp: 37.5,
		id: itemID('Oak logs'),
		name: 'Oak Logs',
		leaf: itemID('Oak leaves'),
		findNewTreeTime: 7,
		bankingTime: 20,
		slope: 0.27,
		intercept: 12.3,
		depletionChance: 100 * (1 / 8),
		wcGuild: true,
		petChance: 361_146,
		qpRequired: 0,
		clueScrollChance: 361_146
	},
	{
		level: 30,
		xp: 67.5,
		id: itemID('Willow logs'),
		name: 'Willow Logs',
		leaf: itemID('Willow leaves'),
		findNewTreeTime: 7,
		bankingTime: 16,
		slope: 0.14,
		intercept: 5.92,
		depletionChance: 100 * (1 / 8),
		wcGuild: true,
		petChance: 289_286,
		qpRequired: 0,
		clueScrollChance: 289_286
	},
	{
		level: 35,
		xp: 85,
		id: itemID('Teak logs'),
		name: 'Teak Logs',
		findNewTreeTime: 4.5,
		bankingTime: 60,
		slope: 0.13,
		intercept: 5.07,
		depletionChance: 100 * (1 / 8),
		petChance: 264_336,
		qpRequired: 0,
		clueScrollChance: 264_336
	},
	{
		level: 45,
		xp: 100,
		id: itemID('Maple logs'),
		name: 'Maple Logs',
		leaf: itemID('Maple leaves'),
		findNewTreeTime: 6,
		bankingTime: 16,
		slope: 0.07,
		intercept: 3,
		depletionChance: 100 * (1 / 8),
		wcGuild: true,
		petChance: 221_918,
		qpRequired: 0,
		clueScrollChance: 221_918
	},
	{
		level: 45,
		xp: 82.5,
		id: itemID('Bark'),
		name: 'Bark',
		findNewTreeTime: 5,
		bankingTime: 60,
		slope: 0.04,
		intercept: 6.24,
		depletionChance: 100 * (1 / 8),
		petChance: 214_367,
		qpRequired: 0,
		clueScrollChance: 214_367
	},
	{
		level: 50,
		xp: 125,
		id: itemID('Mahogany logs'),
		name: 'Mahogany Logs',
		findNewTreeTime: 4.5,
		bankingTime: 60,
		slope: 0.07,
		intercept: 3.05,
		depletionChance: 100 * (1 / 8),
		petChance: 220_623,
		qpRequired: 0,
		clueScrollChance: 220_623
	},
	{
		level: 54,
		xp: 40,
		id: itemID('Arctic pine logs'),
		name: 'Arctic Pine Logs',
		findNewTreeTime: 7,
		bankingTime: 30,
		slope: 0.1,
		intercept: 1.79,
		depletionChance: 100 * (1 / 8),
		petChance: 145_758,
		qpRequired: 0,
		clueScrollChance: 145_758
	},
	{
		level: 60,
		xp: 175,
		id: itemID('Yew logs'),
		name: 'Yew Logs',
		leaf: itemID('Yew leaves'),
		findNewTreeTime: 7,
		bankingTime: 16,
		slope: 0.04,
		intercept: 1.12,
		depletionChance: 100 * (1 / 8),
		wcGuild: true,
		petChance: 145_013,
		qpRequired: 0,
		clueScrollChance: 145_013
	},
	{
		level: 65,
		xp: 127,
		id: itemID('Mushroom'),
		lootTable: sulliuscepTable,
		name: 'Sulliusceps',
		aliases: ['sul', 'sulli', 'mush', 'mushroom'],
		findNewTreeTime: 38,
		bankingTime: 100,
		// TODO: Get real slope and intercept from wiki
		slope: 0.13,
		intercept: 9.47,
		depletionChance: 100 * (1 / 16),
		petChance: 343_000,
		qpRequired: 25,
		clueScrollChance: 343_000,
		clueNestsOnly: true
	},
	{
		level: 75,
		xp: 250,
		id: itemID('Magic logs'),
		name: 'Magic Logs',
		leaf: itemID('Magic leaves'),
		findNewTreeTime: 7,
		bankingTime: 16,
		slope: 0.03,
		intercept: -0.49,
		depletionChance: 100 * (1 / 8),
		wcGuild: true,
		petChance: 72_321,
		qpRequired: 0,
		clueScrollChance: 72_321
	},
	{
		level: 90,
		xp: 380,
		id: itemID('Redwood logs'),
		name: 'Redwood Logs',
		findNewTreeTime: 4.5,
		bankingTime: 20,
		slope: 0.04,
		intercept: -1.56,
		depletionChance: 100 * (1 / 11),
		wcGuild: true,
		petChance: 72_321,
		qpRequired: 0,
		clueScrollChance: 72_321,
		clueNestsOnly: true
	}
];

const lumberjackItems: { [key: number]: number } = {
	[itemID('Lumberjack hat')]: 0.4,
	[itemID('Lumberjack top')]: 0.8,
	[itemID('Lumberjack legs')]: 0.6,
	[itemID('Lumberjack boots')]: 0.2
};

const Woodcutting = {
	aliases: ['wc', 'woodcutting'],
	Logs: logs,
	id: SkillsEnum.Woodcutting,
	emoji: Emoji.Woodcutting,
	name: 'Woodcutting',
	lumberjackItems
};

export default Woodcutting;
