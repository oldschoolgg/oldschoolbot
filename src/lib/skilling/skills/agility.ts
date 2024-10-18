import { Emoji } from '../../constants';
import { QuestID } from '../../minions/data/quests';
import type { Course } from '../types';
import { SkillsEnum } from '../types';

export const courses: Course[] = [
	{
		id: 1,
		name: 'Gnome Stronghold Agility Course',
		aliases: ['gnome', 'gnome stronghold', 'gnome stronghold agility', 'gnome stronghold agility course'],
		level: 1,
		xp: 110.5,
		lapTime: 34,
		petChance: 35_609
	},
	{
		id: 2,
		name: 'Draynor Village Rooftop Course',
		aliases: ['draynor', 'draynor village', 'draynor village rooftop', 'draynor village rooftop course'],
		level: 1,
		xp: 120,
		marksPer60: 12,
		lapTime: 43.2,
		petChance: 33_005
	},
	{
		id: 3,
		name: 'Al Kharid Rooftop Course',
		aliases: ['al kharid', 'al kharid rooftop', 'al kharid rooftop course'],
		level: 20,
		xp: 216,
		marksPer60: 8,
		lapTime: 64.2,
		petChance: 26_648
	},
	{
		id: 4,
		name: 'Varrock Rooftop Course',
		aliases: ['varrock', 'varrock rooftop', 'varrock rooftop course'],
		level: 30,
		xp: 270,
		marksPer60: 12,
		lapTime: 70,
		petChance: 24_410
	},
	{
		id: 5,
		name: 'Canifis Rooftop Course',
		aliases: ['canifis', 'canifis rooftop', 'canifis rooftop course'],
		level: 40,
		xp: 240,
		marksPer60: 19,
		lapTime: 43.8,
		petChance: 36_842
	},
	{
		id: 6,
		name: 'Ape Atoll Agility Course',
		aliases: ['ape atoll', 'ape atoll agility course', 'ape atoll course', 'monky', 'ape', 'monkey'],
		level: 48,
		xp: 580,
		lapTime: 38,
		petChance: 37_720,
		qpRequired: 82
	},
	{
		id: 7,
		name: 'Falador Rooftop Course',
		aliases: ['fally', 'falador', 'fally rooftop', 'falador rooftop', 'falador rooftop course', 'faly'],
		level: 50,
		xp: 586,
		marksPer60: 13,
		lapTime: 58.2,
		petChance: 26_806
	},
	{
		id: 8,
		name: "Seers' Village Rooftop Course",
		aliases: [
			'seers',
			'seers village',
			'seers village rooftop',
			'seers village rooftop course',
			'seer',
			'cammy',
			'camelot'
		],
		level: 60,
		xp: 570,
		marksPer60: 12,
		lapTime: 43.8,
		petChance: 35_205
	},
	{
		id: 9,
		name: 'Pollnivneach Rooftop Course',
		aliases: [
			'pol',
			'pollnivneach',
			'pollnivneach rooftop',
			'pollnivneach rooftop course',
			'poll',
			'polly',
			'poly'
		],
		level: 70,
		xp: 890,
		marksPer60: 9,
		lapTime: 47.4,
		petChance: 33_422
	},
	{
		id: 10,
		name: 'Rellekka Rooftop Course',
		aliases: [
			'rel',
			'rellekka',
			'rellekka rooftop',
			'rellekka rooftop course',
			'fremmy',
			'frem',
			'fremennik',
			'fremmennik',
			'fremy'
		],
		level: 80,
		xp: 780,
		marksPer60: 14,
		lapTime: 51,
		petChance: 31_063
	},
	{
		id: 11,
		name: 'Ardougne Rooftop Course',
		aliases: ['ardy', 'ardougne', 'ardougne rooftop', 'ardougne rooftop course'],
		level: 90,
		xp: 889,
		marksPer60: 22,
		lapTime: 45.6,
		petChance: 34_440
	},
	{
		id: 12,
		name: 'Penguin Agility Course',
		aliases: ['peng', 'penguin agility course', 'penguin'],
		level: 30,
		xp: 540,
		lapTime: 65,
		petChance: 9979
	},
	{
		id: 13,
		name: 'Prifddinas Rooftop Course',
		aliases: [
			'priff',
			'prif',
			'prifddinas',
			'prifddinas course',
			'prifddinas agility course',
			'prifddinas rooftop course'
		],
		level: 75,
		xp: 1340.6,
		lapTime: 74.2,
		petChance: 25_146,
		qpRequired: 205
	},
	{
		id: 14,
		name: 'Agility Pyramid',
		aliases: ['agility pyramid'],
		level: 30,
		xp: agilLevel => 722 + (300 + agilLevel * 8),
		lapTime: 125.1,
		petChance: 9901
	},
	{
		id: 15,
		name: 'Colossal Wyrm Agility Course',
		aliases: ['colossal wyrm agility course', 'colossal wyrm', 'colo', 'wyrm'],
		level: 50,
		xp: agilLevel => (agilLevel >= 62 ? 650 : 520),
		lapTime: 60,
		cantFail: true,
		petChance: agilLevel => (agilLevel >= 62 ? 25_406 : 28_503),
		requiredQuests: [QuestID.ChildrenOfTheSun]
	}
];

export const gracefulItems = [
	'Graceful hood',
	'Graceful top',
	'Graceful legs',
	'Graceful gloves',
	'Graceful boots',
	'Graceful cape',
	'Agility cape',
	'Agility cape(t)'
];

const MonkeyBackpacks = [
	{
		id: 24_862,
		name: 'Karamjan monkey',
		lapsRequired: 100
	},
	{
		id: 24_863,
		name: 'Zombie monkey',
		lapsRequired: 250
	},
	{
		id: 24_864,
		name: 'Maniacal monkey',
		lapsRequired: 500
	},
	{
		id: 24_865,
		name: 'Skeleton monkey',
		lapsRequired: 1000
	},
	{
		id: 24_866,
		name: 'Kruk jr',
		lapsRequired: 1500
	},
	{
		id: 24_867,
		name: 'Princely monkey',
		lapsRequired: 2000
	}
];

const Agility = {
	aliases: ['agility'],
	Courses: courses,
	MonkeyBackpacks,
	id: SkillsEnum.Agility,
	emoji: Emoji.Agility,
	name: 'Agility'
};

export default Agility;
