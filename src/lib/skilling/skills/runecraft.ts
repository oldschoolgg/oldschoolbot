import { Emoji, Time } from '../../constants';
import { Rune, SkillsEnum } from '../types';
import itemID from '../../util/itemID';
import { ActivityTaskOptions } from '../../types/minions';

const Runes: Rune[] = [
	{
		xp: 5,
		id: itemID('Air rune'),
		name: 'Air rune',
		levels: [
			[1, 1],
			[11, 2],
			[22, 3],
			[33, 4],
			[44, 5],
			[55, 6],
			[66, 7],
			[77, 8],
			[88, 9],
			[99, 10]
		],
		tripLength: Time.Minute
	},
	{
		xp: 5.5,
		id: itemID('Mind rune'),
		name: 'Mind rune',
		levels: [
			[2, 1],
			[14, 2],
			[28, 3],
			[42, 4],
			[56, 5],
			[70, 6],
			[84, 7],
			[98, 8]
		],
		tripLength: Time.Minute
	},
	{
		xp: 6,
		id: itemID('Water rune'),
		name: 'Water rune',
		levels: [
			[5, 1],
			[19, 2],
			[38, 3],
			[57, 4],
			[76, 5],
			[95, 6]
		],
		tripLength: Time.Minute
	},
	{
		xp: 6.5,
		id: itemID('Earth rune'),
		name: 'Earth rune',
		levels: [
			[9, 1],
			[26, 2],
			[52, 3],
			[78, 4]
		],
		tripLength: Time.Minute
	},
	{
		xp: 7,
		id: itemID('Fire rune'),
		name: 'Fire rune',
		levels: [
			[14, 1],
			[35, 2],
			[70, 3]
		],
		tripLength: Time.Minute
	},
	{
		xp: 8,
		id: itemID('Cosmic rune'),
		name: 'Cosmic rune',
		levels: [
			[27, 1],
			[59, 2]
		],
		tripLength: Time.Minute * 1.3,
		qpRequired: 5
	},
	{
		xp: 8.5,
		id: itemID('Chaos rune'),
		name: 'Chaos rune',
		levels: [
			[35, 1],
			[74, 2]
		],
		tripLength: Time.Minute * 2
	},
	{
		xp: 8.7,
		id: itemID('Astral rune'),
		name: 'Astral rune',
		levels: [
			[40, 1],
			[82, 2]
		],
		qpRequired: 15,
		tripLength: Time.Minute
	},
	{
		xp: 9,
		id: itemID('Nature rune'),
		name: 'Nature rune',
		levels: [
			[44, 1],
			[91, 2]
		],
		tripLength: Time.Minute * 1.5
	},
	{
		xp: 9.5,
		id: itemID('Law rune'),
		name: 'Law rune',
		levels: [
			[54, 1],
			[95, 2]
		],
		qpRequired: 10,
		tripLength: Time.Minute * 1.7
	},
	{
		xp: 10,
		id: itemID('Death rune'),
		name: 'Death rune',
		levels: [
			[65, 1],
			[99, 2]
		],
		qpRequired: 10,
		tripLength: Time.Minute * 1.3
	},
	{
		xp: 8,
		id: itemID('Wrath rune'),
		name: 'Wrath rune',
		levels: [[95, 1]],
		qpRequired: 200,
		tripLength: Time.Minute
	}
];

const RCPouches = [
	{
		id: itemID('Small pouch'),
		level: 1,
		capacity: 3
	},
	{
		id: itemID('Medium pouch'),
		level: 25,
		capacity: 6
	},
	{
		id: itemID('Large pouch'),
		level: 50,
		capacity: 9
	},
	{
		id: itemID('Giant pouch'),
		level: 75,
		capacity: 12
	}
];

export interface RunecraftActivityTaskOptions extends ActivityTaskOptions {
	runeID: number;
	channelID: string;
	essenceQuantity: number;
}

const Runecraft = {
	aliases: ['runecraft', 'runecrafting'],
	Runes,
	id: SkillsEnum.Runecraft,
	emoji: Emoji.Runecraft,
	timePerInventory: Time.Minute,
	pouches: RCPouches
};

export default Runecraft;
