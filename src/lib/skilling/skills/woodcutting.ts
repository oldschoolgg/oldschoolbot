import { Emoji } from '../../constants';
import { Log, SkillsEnum } from '../types';

const logs: Log[] = [
	{
		level: 1,
		xp: 25,
		id: 1511,
		name: 'Logs',
		respawnTime: 3,
		petChance: 317_647,
		qpRequired: 0,
		clueScrollChance: 317_647
	},
	{
		level: 1,
		xp: 25,
		id: 2862,
		name: 'Achey Logs',
		respawnTime: 2.5,
		petChance: 317_647,
		qpRequired: 0,
		clueScrollChance: 317_647
	},
	{
		level: 15,
		xp: 37.5,
		id: 1521,
		name: 'Oak Logs',
		respawnTime: 0.5,
		petChance: 361_146,
		qpRequired: 0,
		clueScrollChance: 361_146
	},
	{
		level: 30,
		xp: 67.5,
		id: 1519,
		name: 'Willow Logs',
		respawnTime: -0.25,
		petChance: 289_286,
		qpRequired: 0,
		clueScrollChance: 289_286
	},
	{
		level: 35,
		xp: 85,
		id: 6333,
		name: 'Teak Logs',
		respawnTime: -1,
		petChance: 264_336,
		qpRequired: 0,
		clueScrollChance: 264_336
	},
	{
		level: 45,
		xp: 100,
		id: 1517,
		name: 'Maple Logs',
		respawnTime: 0.75,
		petChance: 221_918,
		qpRequired: 0,
		clueScrollChance: 221_918
	},
	{
		level: 45,
		xp: 82.5,
		id: 3239,
		name: 'Bark',
		respawnTime: 0,
		petChance: 214_367,
		qpRequired: 0,
		clueScrollChance: 214_367
	},
	{
		level: 50,
		xp: 125,
		id: 6332,
		name: 'Mahogany Logs',
		respawnTime: 2,
		petChance: 220_623,
		qpRequired: 0,
		clueScrollChance: 220_623
	},
	{
		level: 54,
		xp: 40,
		id: 10810,
		name: 'Arctic Pine Logs',
		respawnTime: 4.5,
		petChance: 145_758,
		qpRequired: 0,
		clueScrollChance: 145_758
	},
	{
		level: 60,
		xp: 175,
		id: 1515,
		name: 'Yew Logs',
		respawnTime: 5,
		petChance: 145_013,
		qpRequired: 0,
		clueScrollChance: 145_013
	},
	{
		level: 65,
		xp: 127,
		id: 6004,
		name: 'Sulliusceps',
		respawnTime: -2,
		petChance: 343_000,
		qpRequired: 25,
		clueScrollChance: 343_000
	},
	{
		level: 75,
		xp: 250,
		id: 1513,
		name: 'Magic Logs',
		respawnTime: 15,
		petChance: 72_321,
		qpRequired: 0,
		clueScrollChance: 72_321
	},
	{
		level: 90,
		xp: 380,
		id: 19669,
		name: 'Redwood Logs',
		respawnTime: 1.5,
		petChance: 72_321,
		qpRequired: 0,
		clueScrollChance: 72_321
	}
];

const Woodcutting = {
	aliases: ['wc', 'woodcutting'],
	Logs: logs,
	id: SkillsEnum.Woodcutting,
	emoji: Emoji.Woodcutting,
	name: 'Woodcutting'
};

export default Woodcutting;
