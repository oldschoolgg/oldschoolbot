import { Time } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { Emoji } from '../../constants';
import itemID from '../../util/itemID';
import { SkillsEnum } from '../types';

export interface Rune {
	levels: number[][];
	xp: number;
	id: number;
	name: string;
	qpRequired?: number;
	tripLength: number;
	inputRune?: Bank;
	inputTalisman?: Bank;
	stams?: boolean;
	ardyDiaryChance?: number;
}

interface Tiara {
	xp: number;
	id: number;
	name: string;
	qpRequired?: number;
	tripLength: number;
	inputTalisman: Bank;
}

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
		tripLength: Time.Minute * 0.917,
		ardyDiaryChance: 25
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
		tripLength: Time.Minute * 0.917,
		ardyDiaryChance: 25
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
		tripLength: Time.Minute * 0.917,
		ardyDiaryChance: 25
	},
	{
		xp: 8.5,
		id: itemID('Mist rune'),
		name: 'Mist rune',
		levels: [[6, 1]],
		tripLength: Time.Minute * 0.87,
		inputRune: new Bank({ 'Air rune': 1 }),
		inputTalisman: new Bank({ 'Air talisman': 1 }),
		stams: true
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
		tripLength: Time.Minute * 0.917,
		ardyDiaryChance: 25
	},
	{
		xp: 9,
		id: itemID('Dust rune'),
		name: 'Dust rune',
		levels: [[10, 1]],
		tripLength: Time.Minute * 0.87,
		inputRune: new Bank({ 'Air rune': 1 }),
		inputTalisman: new Bank({ 'Air talisman': 1 }),
		stams: true
	},
	{
		xp: 9.5,
		id: itemID('Mud rune'),
		name: 'Mud rune',
		levels: [[13, 1]],
		tripLength: Time.Minute * 0.87,
		inputRune: new Bank({ 'Water rune': 1 }),
		inputTalisman: new Bank({ 'Water talisman': 1 }),
		stams: true
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
		tripLength: Time.Minute * 0.917,
		ardyDiaryChance: 25
	},
	{
		xp: 9.5,
		id: itemID('Smoke rune'),
		name: 'Smoke rune',
		levels: [[15, 1]],
		tripLength: Time.Minute * 0.515,
		inputRune: new Bank({ 'Air rune': 1 }),
		inputTalisman: new Bank({ 'Air talisman': 1 }),
		stams: true
	},
	{
		xp: 10,
		id: itemID('Steam rune'),
		name: 'Steam rune',
		levels: [[19, 1]],
		tripLength: Time.Minute * 0.515,
		inputRune: new Bank({ 'Water rune': 1 }),
		inputTalisman: new Bank({ 'Water talisman': 1 }),
		stams: true
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
		tripLength: Time.Minute * 0.917,
		ardyDiaryChance: 25
	},
	{
		xp: 10.5,
		id: itemID('Lava rune'),
		name: 'Lava rune',
		levels: [[23, 1]],
		tripLength: Time.Minute * 0.515,
		inputRune: new Bank({ 'Earth rune': 1 }),
		inputTalisman: new Bank({ 'Earth talisman': 1 }),
		stams: true
	},
	{
		xp: 8,
		id: itemID('Cosmic rune'),
		name: 'Cosmic rune',
		levels: [
			[27, 1],
			[59, 2]
		],
		tripLength: Time.Minute * 1.192,
		qpRequired: 5,
		ardyDiaryChance: 25
	},
	{
		xp: 8.5,
		id: itemID('Chaos rune'),
		name: 'Chaos rune',
		levels: [
			[35, 1],
			[74, 2]
		],
		tripLength: Time.Minute * 1.834,
		ardyDiaryChance: 25
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
		tripLength: Time.Minute * 0.917,
		ardyDiaryChance: 25
	},
	{
		xp: 9,
		id: itemID('Nature rune'),
		name: 'Nature rune',
		levels: [
			[44, 1],
			[91, 2]
		],
		tripLength: Time.Minute * 1.38,
		ardyDiaryChance: 22.5
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
		tripLength: Time.Minute * 1.56,
		ardyDiaryChance: 20
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
		tripLength: Time.Minute * 1.192,
		ardyDiaryChance: 17.5
	},
	{
		xp: 10.5,
		id: itemID('Blood rune'),
		name: 'Blood rune',
		levels: [[77, 1]],
		qpRequired: 125,
		tripLength: Time.Minute * 1.028,
		stams: true,
		ardyDiaryChance: 15
	},
	{
		xp: 8,
		id: itemID('Wrath rune'),
		name: 'Wrath rune',
		levels: [[95, 1]],
		qpRequired: 200,
		tripLength: Time.Minute * 0.917
	}
];

const RCPouches = [
	{
		id: itemID('Colossal pouch'),
		level: 85,
		capacity: 40
	},
	{
		id: itemID('Giant pouch'),
		level: 75,
		capacity: 12
	},
	{
		id: itemID('Large pouch'),
		level: 50,
		capacity: 9
	},
	{
		id: itemID('Medium pouch'),
		level: 25,
		capacity: 6
	},
	{
		id: itemID('Small pouch'),
		level: 1,
		capacity: 3
	}
];

const raimentsOfTheEyeItems: { [key: number]: number } = {
	[itemID('Hat of the eye')]: 10,
	[itemID('Robe top of the eye')]: 10,
	[itemID('Robe bottoms of the eye')]: 10,
	[itemID('Boots of the eye')]: 10
};

const Tiaras: Tiara[] = [
	{
		xp: 25,
		id: itemID('Air tiara'),
		name: 'Air tiara',
		tripLength: Time.Minute,
		inputTalisman: new Bank({ 'Air talisman': 1 })
	},
	{
		xp: 52.5,
		id: itemID('Blood tiara'),
		name: 'Blood tiara',
		tripLength: Time.Minute,
		inputTalisman: new Bank({ 'Blood talisman': 1 })
	},
	{
		xp: 37.5,
		id: itemID('Body tiara'),
		name: 'Body tiara',
		tripLength: Time.Minute,
		inputTalisman: new Bank({ 'Body talisman': 1 })
	},
	{
		xp: 42.5,
		id: itemID('Chaos tiara'),
		name: 'Chaos tiara',
		tripLength: Time.Minute * 2,
		inputTalisman: new Bank({ 'Chaos talisman': 1 })
	},
	{
		xp: 40,
		id: itemID('Cosmic tiara'),
		name: 'Cosmic tiara',
		tripLength: Time.Minute * 1.3,
		inputTalisman: new Bank({ 'Cosmic talisman': 1 }),
		qpRequired: 5
	},
	{
		xp: 50,
		id: itemID('Death tiara'),
		name: 'Death tiara',
		tripLength: Time.Minute * 1.3,
		inputTalisman: new Bank({ 'Death talisman': 1 }),
		qpRequired: 10
	},
	{
		xp: 32.5,
		id: itemID('Earth tiara'),
		name: 'Earth tiara',
		tripLength: Time.Minute,
		inputTalisman: new Bank({ 'Earth talisman': 1 })
	},
	{
		xp: 35,
		id: itemID('Fire tiara'),
		name: 'Fire tiara',
		tripLength: Time.Minute,
		inputTalisman: new Bank({ 'Fire talisman': 1 })
	},
	{
		xp: 47.5,
		id: itemID('Law tiara'),
		name: 'Law tiara',
		tripLength: Time.Minute * 1.7,
		inputTalisman: new Bank({ 'Law talisman': 1 }),
		qpRequired: 10
	},
	{
		xp: 27.5,
		id: itemID('Mind tiara'),
		name: 'Mind tiara',
		tripLength: Time.Minute,
		inputTalisman: new Bank({ 'Mind talisman': 1 })
	},
	{
		xp: 45,
		id: itemID('Nature tiara'),
		name: 'Nature tiara',
		tripLength: Time.Minute * 1.5,
		inputTalisman: new Bank({ 'Nature talisman': 1 })
	},
	{
		xp: 30,
		id: itemID('Water tiara'),
		name: 'Water tiara',
		tripLength: Time.Minute,
		inputTalisman: new Bank({ 'Water talisman': 1 })
	},
	{
		xp: 52.5,
		id: itemID('Wrath tiara'),
		name: 'Wrath tiara',
		tripLength: Time.Minute,
		inputTalisman: new Bank({ 'Wrath talisman': 1 }),
		qpRequired: 200
	}
];

export const ouraniaAltarTables: LootTable[] = [
	new LootTable()
		.add('Air rune', 1, 5000)
		.add('Mind rune', 1, 2500)
		.add('Water rune', 1, 1200)
		.add('Earth rune', 1, 600)
		.add('Fire rune', 1, 300)
		.add('Body rune', 1, 150)
		.add('Cosmic rune', 1, 85)
		.add('Chaos rune', 1, 60)
		.add('Astral rune', 1, 45)
		.add('Nature rune', 1, 30)
		.add('Law rune', 1, 15)
		.add('Death rune', 1, 8)
		.add('Blood rune', 1, 5)
		.add('Soul rune', 1, 2),
	new LootTable()
		.add('Air rune', 1, 1500)
		.add('Mind rune', 1, 1800)
		.add('Water rune', 1, 2100)
		.add('Earth rune', 1, 2400)
		.add('Fire rune', 1, 1200)
		.add('Body rune', 1, 600)
		.add('Cosmic rune', 1, 175)
		.add('Chaos rune', 1, 80)
		.add('Astral rune', 1, 60)
		.add('Nature rune', 1, 40)
		.add('Law rune', 1, 24)
		.add('Death rune', 1, 12)
		.add('Blood rune', 1, 6)
		.add('Soul rune', 1, 3),
	new LootTable()
		.add('Air rune', 1, 1200)
		.add('Mind rune', 1, 1300)
		.add('Water rune', 1, 1350)
		.add('Earth rune', 1, 1400)
		.add('Fire rune', 1, 1500)
		.add('Body rune', 1, 1600)
		.add('Cosmic rune', 1, 800)
		.add('Chaos rune', 1, 420)
		.add('Astral rune', 1, 210)
		.add('Nature rune', 1, 110)
		.add('Law rune', 1, 55)
		.add('Death rune', 1, 32)
		.add('Blood rune', 1, 15)
		.add('Soul rune', 1, 8),
	new LootTable()
		.add('Air rune', 1, 700)
		.add('Mind rune', 1, 800)
		.add('Water rune', 1, 900)
		.add('Earth rune', 1, 1100)
		.add('Fire rune', 1, 1200)
		.add('Body rune', 1, 1300)
		.add('Cosmic rune', 1, 2000)
		.add('Chaos rune', 1, 1000)
		.add('Astral rune', 1, 500)
		.add('Nature rune', 1, 250)
		.add('Law rune', 1, 130)
		.add('Death rune', 1, 60)
		.add('Blood rune', 1, 40)
		.add('Soul rune', 1, 20),
	new LootTable()
		.add('Air rune', 1, 600)
		.add('Mind rune', 1, 650)
		.add('Water rune', 1, 700)
		.add('Earth rune', 1, 750)
		.add('Fire rune', 1, 800)
		.add('Body rune', 1, 1000)
		.add('Cosmic rune', 1, 1500)
		.add('Chaos rune', 1, 2000)
		.add('Astral rune', 1, 1000)
		.add('Nature rune', 1, 500)
		.add('Law rune', 1, 260)
		.add('Death rune', 1, 120)
		.add('Blood rune', 1, 80)
		.add('Soul rune', 1, 40),
	new LootTable()
		.add('Air rune', 1, 500)
		.add('Mind rune', 1, 550)
		.add('Water rune', 1, 600)
		.add('Earth rune', 1, 650)
		.add('Fire rune', 1, 700)
		.add('Body rune', 1, 750)
		.add('Cosmic rune', 1, 1000)
		.add('Chaos rune', 1, 1100)
		.add('Astral rune', 1, 1500)
		.add('Nature rune', 1, 1350)
		.add('Law rune', 1, 700)
		.add('Death rune', 1, 350)
		.add('Blood rune', 1, 170)
		.add('Soul rune', 1, 80),
	new LootTable()
		.add('Air rune', 1, 450)
		.add('Mind rune', 1, 500)
		.add('Water rune', 1, 550)
		.add('Earth rune', 1, 600)
		.add('Fire rune', 1, 700)
		.add('Body rune', 1, 750)
		.add('Cosmic rune', 1, 950)
		.add('Chaos rune', 1, 1050)
		.add('Astral rune', 1, 1400)
		.add('Nature rune', 1, 1550)
		.add('Law rune', 1, 800)
		.add('Death rune', 1, 400)
		.add('Blood rune', 1, 200)
		.add('Soul rune', 1, 100),
	new LootTable()
		.add('Air rune', 1, 300)
		.add('Mind rune', 1, 300)
		.add('Water rune', 1, 300)
		.add('Earth rune', 1, 400)
		.add('Fire rune', 1, 400)
		.add('Body rune', 1, 500)
		.add('Cosmic rune', 1, 700)
		.add('Chaos rune', 1, 900)
		.add('Astral rune', 1, 1200)
		.add('Nature rune', 1, 1500)
		.add('Law rune', 1, 1800)
		.add('Death rune', 1, 1000)
		.add('Blood rune', 1, 500)
		.add('Soul rune', 1, 200),
	new LootTable()
		.add('Air rune', 1, 200)
		.add('Mind rune', 1, 200)
		.add('Water rune', 1, 300)
		.add('Earth rune', 1, 400)
		.add('Fire rune', 1, 500)
		.add('Body rune', 1, 600)
		.add('Cosmic rune', 1, 700)
		.add('Chaos rune', 1, 800)
		.add('Astral rune', 1, 1050)
		.add('Nature rune', 1, 1350)
		.add('Law rune', 1, 1450)
		.add('Death rune', 1, 1450)
		.add('Blood rune', 1, 600)
		.add('Soul rune', 1, 400),
	new LootTable()
		.add('Air rune', 1, 100)
		.add('Mind rune', 1, 100)
		.add('Water rune', 1, 200)
		.add('Earth rune', 1, 300)
		.add('Fire rune', 1, 400)
		.add('Body rune', 1, 500)
		.add('Cosmic rune', 1, 600)
		.add('Chaos rune', 1, 700)
		.add('Astral rune', 1, 1000)
		.add('Nature rune', 1, 1350)
		.add('Law rune', 1, 1450)
		.add('Death rune', 1, 1650)
		.add('Blood rune', 1, 1000)
		.add('Soul rune', 1, 650),
	new LootTable()
		.add('Air rune', 1, 100)
		.add('Mind rune', 1, 100)
		.add('Water rune', 1, 200)
		.add('Earth rune', 1, 300)
		.add('Fire rune', 1, 300)
		.add('Body rune', 1, 400)
		.add('Cosmic rune', 1, 500)
		.add('Chaos rune', 1, 600)
		.add('Astral rune', 1, 950)
		.add('Nature rune', 1, 1350)
		.add('Law rune', 1, 1450)
		.add('Death rune', 1, 1550)
		.add('Blood rune', 1, 1300)
		.add('Soul rune', 1, 900)
];

const Runecraft = {
	aliases: ['runecraft', 'runecrafting'],
	Runes,
	Tiaras,
	id: SkillsEnum.Runecraft,
	emoji: Emoji.Runecraft,
	timePerInventory: Time.Minute,
	pouches: RCPouches,
	name: 'Runecraft',
	raimentsOfTheEyeItems
};

export default Runecraft;
