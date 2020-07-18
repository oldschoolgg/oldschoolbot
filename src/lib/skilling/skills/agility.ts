import { Emoji } from '../../constants';
import { Course, SkillsEnum } from '../types';

const courses: Course[] = [
	{
		name: 'Gnome Stronghold Agility Course',
		aliases: ['gnome stronghold', 'gnome'],
		level: 1,
		xp: 88,
		lapTime: 34,
		petChance: 35_609
	},
	{
		name: 'Draynor Village Rooftop Course',
		aliases: ['draynor'],
		level: 10,
		xp: 120,
		marksPer60: 12,
		lapTime: 43.2,
		petChance: 33_005
	},
	{
		name: 'Al Kharid Rooftop Course',
		aliases: ['al kharid'],
		level: 20,
		xp: 180,
		marksPer60: 8,
		lapTime: 64.8,
		petChance: 26_648
	},
	{
		name: 'Varrock Rooftop Course',
		aliases: ['varrock'],
		level: 30,
		xp: 238,
		marksPer60: 12,
		lapTime: 66,
		petChance: 24_410
	},
	{
		name: 'Canifis Rooftop Course',
		aliases: ['canifis'],
		level: 40,
		xp: 240,
		marksPer60: 19,
		lapTime: 45,
		petChance: 36_842
	},
	{
		name: 'Falador Rooftop Course',
		aliases: ['fally', 'falador'],
		level: 50,
		xp: 440,
		marksPer60: 13,
		lapTime: 58.2,
		petChance: 26_806
	},
	{
		name: `Seers' Village Rooftop Course`,
		aliases: ['seers', 'seers village'],
		level: 60,
		xp: 570,
		marksPer60: 12,
		lapTime: 44.4,
		petChance: 35_205
	},
	{
		name: 'Pollnivneach Rooftop Course',
		aliases: ['pol', 'pollnivneach'],
		level: 70,
		xp: 890,
		marksPer60: 9,
		lapTime: 61.2,
		petChance: 33_422
	},
	{
		name: 'Rellekka Rooftop Course',
		aliases: ['rel', 'rellekka'],
		level: 80,
		xp: 780,
		marksPer60: 14,
		lapTime: 51,
		petChance: 31_063
	},
	{
		name: 'Ardougne Rooftop Course',
		aliases: ['ardy', 'ardougne'],
		level: 90,
		xp: 793,
		marksPer60: 22,
		lapTime: 45.6,
		petChance: 34_440
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

const Agility = {
	aliases: ['agility'],
	Courses: courses,
	id: SkillsEnum.Agility,
	emoji: Emoji.Agility
};

export default Agility;
