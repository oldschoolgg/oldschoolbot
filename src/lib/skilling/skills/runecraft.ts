import { Bank } from 'oldschooljs';

import { Emoji, Time } from '../../constants';
import itemID from '../../util/itemID';
import { Rune, SkillsEnum } from '../types';

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
		xp: 8.5,
		id: itemID('Mist rune'),
		name: 'Mist rune',
		levels: [[6, 1]],
		tripLength: Time.Minute * 0.95,
		inputRune: new Bank({ 'Air rune': 1 }),
		inputTalisman: new Bank({ 'Air talisman': 1 })
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
		xp: 9,
		id: itemID('Dust rune'),
		name: 'Dust rune',
		levels: [[10, 1]],
		tripLength: Time.Minute * 0.95,
		inputRune: new Bank({ 'Air rune': 1 }),
		inputTalisman: new Bank({ 'Air talisman': 1 })
	},
	{
		xp: 9.5,
		id: itemID('Mud rune'),
		name: 'Mud rune',
		levels: [[13, 1]],
		tripLength: Time.Minute * 0.95,
		inputRune: new Bank({ 'Water rune': 1 }),
		inputTalisman: new Bank({ 'Water talisman': 1 })
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
		xp: 9.5,
		id: itemID('Smoke rune'),
		name: 'Smoke rune',
		levels: [[15, 1]],
		tripLength: Time.Minute * 0.56,
		inputRune: new Bank({ 'Air rune': 1 }),
		inputTalisman: new Bank({ 'Air talisman': 1 })
	},
	{
		xp: 10,
		id: itemID('Steam rune'),
		name: 'Steam rune',
		levels: [[19, 1]],
		tripLength: Time.Minute * 0.56,
		inputRune: new Bank({ 'Water rune': 1 }),
		inputTalisman: new Bank({ 'Water talisman': 1 })
	},
	{
		xp: 7.5,
		id: itemID('Body rune'),
		name: 'Body rune',
		levels: [
			[20, 1],
			[46, 2],
			[92, 3]
		],
		tripLength: Time.Minute
	},
	{
		xp: 10.5,
		id: itemID('Lava rune'),
		name: 'Lava rune',
		levels: [[23, 1]],
		tripLength: Time.Minute * 0.56,
		inputRune: new Bank({ 'Earth rune': 1 }),
		inputTalisman: new Bank({ 'Earth talisman': 1 }),
		runners: true
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

const Runecraft = {
	aliases: ['runecraft', 'runecrafting'],
	Runes,
	id: SkillsEnum.Runecraft,
	emoji: Emoji.Runecraft,
	timePerInventory: Time.Minute,
	pouches: RCPouches,
	name: 'Runecraft'
};

export default Runecraft;
