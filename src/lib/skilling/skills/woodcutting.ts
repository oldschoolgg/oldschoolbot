import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import { Log, SkillsEnum } from '../types';

const logs: Log[] = [
	{
		level: 1,
		xp: 25,
		id: 1511,
		name: 'Logs',
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
		id: 2862,
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
		id: 1521,
		name: 'Oak Logs',
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
		id: 1519,
		name: 'Willow Logs',
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
		id: 6333,
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
		id: 1517,
		name: 'Maple Logs',
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
		id: 3239,
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
		id: 6332,
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
		id: 10_810,
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
		id: 1515,
		name: 'Yew Logs',
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
		id: 6004,
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
		clueScrollChance: 343_000
	},
	{
		level: 75,
		xp: 250,
		id: 1513,
		name: 'Magic Logs',
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
		id: 19_669,
		name: 'Redwood Logs',
		findNewTreeTime: 4.5,
		bankingTime: 20,
		slope: 0.04,
		intercept: -1.56,
		depletionChance: 100 * (1 / 11),
		wcGuild: true,
		petChance: 72_321,
		qpRequired: 0,
		clueScrollChance: 72_321
	},
	{
		level: 105,
		xp: 300,
		id: 50_017,
		name: 'Elder Logs',
		findNewTreeTime: 4.5,
		bankingTime: 20,
		slope: 0.057,
		intercept: -0.71,
		depletionChance: 100 * (1 / 11),
		petChance: 42_321,
		qpRequired: 0,
		clueScrollChance: 42_321
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
