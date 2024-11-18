import { Time } from 'e';
import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

import { nestTable, strungRabbitFootNestTable } from '../../../simulation/birdsNest';
import getOSItem from '../../../util/getOSItem';

export interface Birdhouse {
	name: string;
	aliases: string[];
	huntLvl: number;
	huntXP: number;
	craftLvl: number;
	craftXP: number;
	houseItemReq: Bank;
	craftItemReq: Bank;
	table: LootTable;
	normalNestTable: LootTable;
	strungRabbitFootTable: LootTable;
	huntTechnique: string;
	waitTime: number;
	runTime: number;
	qpRequired: number;
}

const birdhouses: Birdhouse[] = [
	{
		name: 'Bird house',
		aliases: ['regular', 'normal', 'bird house', 'normal bird house', 'regular bird house', 'logs'],
		huntLvl: 5,
		huntXP: 280,
		craftLvl: 5,
		craftXP: 15,
		houseItemReq: new Bank().add('Bird house', 1),
		craftItemReq: new Bank().add('Logs', 1),
		table: new LootTable().every('Raw bird meat', [1, 5]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable),
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
		table: new LootTable().every('Raw bird meat', [1, 5]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable, [1, 2]),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable, [1, 2]),
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
		table: new LootTable().every('Raw bird meat', [1, 5]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable, [1, 3]),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable, [1, 3]),
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
		table: new LootTable().every('Raw bird meat', [1, 5]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable, [1, 4]),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable, [1, 4]),
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
		table: new LootTable().every('Raw bird meat', [1, 5]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable, [1, 5]),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable, [1, 5]),
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
		table: new LootTable().every('Raw bird meat', [1, 4]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable, [1, 6]),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable, [1, 6]),
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
		table: new LootTable().every('Raw bird meat', [1, 4]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable, [1, 7]),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable, [1, 7]),
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
		table: new LootTable().every('Raw bird meat', [1, 3]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable, [1, 8]),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable, [1, 8]),
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
		table: new LootTable().every('Raw bird meat', [1, 3]).tertiary(3, 'Feather', [10, 100]),
		normalNestTable: new LootTable().tertiary(2, nestTable, [1, 9]),
		strungRabbitFootTable: new LootTable().tertiary(2, strungRabbitFootNestTable, [1, 9]),
		huntTechnique: 'bird house trapping',
		waitTime: 50 * Time.Minute,
		runTime: 81 * Time.Second,
		qpRequired: 3
	}
];

export const birdhouseSeeds = [
	{
		item: getOSItem('Hammerstone seed'),
		amount: 10
	},
	{
		item: getOSItem('Asgarnian seed'),
		amount: 10
	},
	{
		item: getOSItem('Barley seed'),
		amount: 10
	},
	{
		item: getOSItem('Yanillian seed'),
		amount: 10
	},
	{
		item: getOSItem('Krandorian seed'),
		amount: 10
	},
	{
		item: getOSItem('Wildblood seed'),
		amount: 5
	},
	{
		item: getOSItem('Potato seed'),
		amount: 10
	},
	{
		item: getOSItem('Onion seed'),
		amount: 10
	},
	{
		item: getOSItem('Cabbage seed'),
		amount: 10
	},
	{
		item: getOSItem('Tomato seed'),
		amount: 10
	},
	{
		item: getOSItem('Sweetcorn seed'),
		amount: 10
	},
	{
		item: getOSItem('Strawberry seed'),
		amount: 10
	},
	{
		item: getOSItem('Watermelon seed'),
		amount: 10
	},
	{
		item: getOSItem('Marigold seed'),
		amount: 10
	},
	{
		item: getOSItem('Rosemary seed'),
		amount: 10
	},
	{
		item: getOSItem('Nasturtium seed'),
		amount: 10
	},
	{
		item: getOSItem('Woad seed'),
		amount: 10
	},
	{
		item: getOSItem('Limpwurt seed'),
		amount: 10
	},
	{
		item: getOSItem('Marrentill seed'),
		amount: 10
	},
	{
		item: getOSItem('Guam seed'),
		amount: 10
	},
	{
		item: getOSItem('Tarromin seed'),
		amount: 10
	},
	{
		item: getOSItem('Harralander seed'),
		amount: 10
	},
	{
		item: getOSItem('Jute seed'),
		amount: 10
	},
	{
		item: getOSItem('White lily seed'),
		amount: 10
	},
	{
		item: getOSItem('Snape grass seed'),
		amount: 10
	},
	{
		item: getOSItem('Irit seed'),
		amount: 5
	},
	{
		item: getOSItem('Dwarf weed seed'),
		amount: 5
	},
	{
		item: getOSItem('Kwuarm seed'),
		amount: 5
	},
	{
		item: getOSItem('Cadantine seed'),
		amount: 5
	},
	{
		item: getOSItem('Lantadyme seed'),
		amount: 5
	},
	{
		item: getOSItem('Avantoe seed'),
		amount: 5
	},
	{
		item: getOSItem('Toadflax seed'),
		amount: 5
	},
	{
		item: getOSItem('Ranarr seed'),
		amount: 5
	},
	{
		item: getOSItem('Snapdragon seed'),
		amount: 5
	},
	{
		item: getOSItem('Torstol seed'),
		amount: 5
	}
];

export default birdhouses;
