import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Time } from '../../../constants';
import { NestBoxes } from '../../../openables';

interface Birdhouse {
	name: string;
	aliases: string[];
	huntLvl: number;
	huntXP: number;
	craftLvl: number;
	craftXP: number;
	houseItemReq: Bank;
	craftItemReq: Bank;
	table: LootTable;
	huntTechnique: string;
	waitTime: number;
	runTime: number;
	qpRequired: number;
}

const birdhouses: Birdhouse[] = [
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
		huntXP: 280,
		craftLvl: 5,
		craftXP: 15,
		houseItemReq: new Bank().add('Bird house', 1),
		craftItemReq: new Bank().add('Logs', 1),
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
		huntXP: 420,
		craftLvl: 15,
		craftXP: 20,
		houseItemReq: new Bank().add('Oak bird house', 1),
		craftItemReq: new Bank().add('Oak logs', 1),
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
		huntXP: 560,
		craftLvl: 25,
		craftXP: 25,
		houseItemReq: new Bank().add('Willow bird house', 1),
		craftItemReq: new Bank().add('Willow logs', 1),
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
		huntXP: 700,
		craftLvl: 35,
		craftXP: 30,
		houseItemReq: new Bank().add('Teak bird house', 1),
		craftItemReq: new Bank().add('Teak logs', 1),
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
		huntXP: 820,
		craftLvl: 45,
		craftXP: 35,
		houseItemReq: new Bank().add('Maple bird house', 1),
		craftItemReq: new Bank().add('Maple logs', 1),
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
		huntXP: 960,
		craftLvl: 50,
		craftXP: 40,
		houseItemReq: new Bank().add('Mahogany bird house', 1),
		craftItemReq: new Bank().add('Mahogany logs', 1),
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
		huntXP: 1020,
		craftLvl: 60,
		craftXP: 45,
		houseItemReq: new Bank().add('Yew bird house', 1),
		craftItemReq: new Bank().add('Yew logs', 1),
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
		huntXP: 1140,
		craftLvl: 75,
		craftXP: 50,
		houseItemReq: new Bank().add('Magic bird house', 1),
		craftItemReq: new Bank().add('Magic logs', 1),
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
		huntXP: 1200,
		craftLvl: 90,
		craftXP: 55,
		houseItemReq: new Bank().add('Redwood bird house', 1),
		craftItemReq: new Bank().add('Redwood logs', 1),
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

export default birdhouses;
