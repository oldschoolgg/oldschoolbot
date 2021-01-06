import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Time } from '../../../constants';
import { resolveNameBank } from '../../../util';
import { NestBoxes } from './../../../openables';
import { ItemBank } from './../../../types/index';

interface BirdHouse {
	name: string;
	aliases: string[];
	huntLvl: number;
	huntXp: number;
	craftLvl: number;
	craftXp: number;
	houseItemReq: ItemBank;
	craftItemReq: ItemBank;
	table: LootTable;
	huntTechnique: string;
	waitTime: number;
	runTime: number;
	qpRequired: number;
}

const birdHouses: BirdHouse[] = [
	{
		name: 'Bird house',
		aliases: [
			'regular',
			'normal',
			'bird house',
			'normal bird house',
			'regular bird house',
			'logs'
		],
		huntLvl: 5,
		huntXp: 280,
		craftLvl: 5,
		craftXp: 15,
		houseItemReq: resolveNameBank({ 'Bird house': 1 }),
		craftItemReq: resolveNameBank({ Logs: 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes)
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	},
	{
		name: 'Oak bird house',
		aliases: ['oak', 'oak bird house', 'oak house', 'oak logs'],
		huntLvl: 14,
		huntXp: 420,
		craftLvl: 15,
		craftXp: 20,
		houseItemReq: resolveNameBank({ 'Oak bird house': 1 }),
		craftItemReq: resolveNameBank({ 'Oak logs': 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes, [1, 2])
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	},
	{
		name: 'Willow bird house',
		aliases: ['willow', 'willow bird house', 'willow house', 'willow logs'],
		huntLvl: 24,
		huntXp: 560,
		craftLvl: 25,
		craftXp: 25,
		houseItemReq: resolveNameBank({ 'Willow bird house': 1 }),
		craftItemReq: resolveNameBank({ 'Willow logs': 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes, [1, 3])
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	},
	{
		name: 'Teak bird house',
		aliases: ['teak', 'teak bird house', 'teak house', 'teak logs'],
		huntLvl: 34,
		huntXp: 700,
		craftLvl: 35,
		craftXp: 30,
		houseItemReq: resolveNameBank({ 'Teak bird house': 1 }),
		craftItemReq: resolveNameBank({ 'Teak logs': 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes, [1, 4])
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	},
	{
		name: 'Maple bird house',
		aliases: ['maple', 'maple bird house', 'maple house', 'maple logs'],
		huntLvl: 44,
		huntXp: 820,
		craftLvl: 45,
		craftXp: 35,
		houseItemReq: resolveNameBank({ 'Maple bird house': 1 }),
		craftItemReq: resolveNameBank({ 'maple logs': 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes, [1, 5])
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	},
	{
		name: 'Mahogany bird house',
		aliases: ['mahogany', 'mahogany bird house', 'mahogany house', 'mahogany logs'],
		huntLvl: 49,
		huntXp: 960,
		craftLvl: 50,
		craftXp: 40,
		houseItemReq: resolveNameBank({ 'Mahogany bird house': 1 }),
		craftItemReq: resolveNameBank({ 'Mahogany logs': 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes, [1, 6])
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	},
	{
		name: 'Yew bird house',
		aliases: ['yew', 'yew bird house', 'yew house', 'yew logs'],
		huntLvl: 59,
		huntXp: 1020,
		craftLvl: 60,
		craftXp: 45,
		houseItemReq: resolveNameBank({ 'Yew bird house': 1 }),
		craftItemReq: resolveNameBank({ 'Yew logs': 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes, [1, 7])
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	},
	{
		name: 'Magic bird house',
		aliases: ['magic', 'magic bird house', 'magic house', 'magic logs'],
		huntLvl: 74,
		huntXp: 1140,
		craftLvl: 75,
		craftXp: 50,
		houseItemReq: resolveNameBank({ 'Magic bird house': 1 }),
		craftItemReq: resolveNameBank({ 'Magic logs': 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes, [1, 8])
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	},
	{
		name: 'Redwood bird house',
		aliases: ['redwood', 'redwood bird house', 'redwood house', 'redwood logs'],
		huntLvl: 89,
		huntXp: 1200,
		craftLvl: 90,
		craftXp: 55,
		houseItemReq: resolveNameBank({ 'Redwood bird house': 1 }),
		craftItemReq: resolveNameBank({ 'Redwood logs': 1 }),
		table: new LootTable()
			.every('Raw bird meat')
			.tertiary(2, NestBoxes, [1, 9])
			.tertiary(3, 'Feather', 10),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	}
];

export default birdHouses;
