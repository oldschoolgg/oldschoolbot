import { Time } from '@oldschoolgg/toolkit';
import { Bank, EItem, Items, LootTable } from 'oldschooljs';

import { nestTable, strungRabbitFootNestTable } from '@/lib/simulation/birdsNest.js';

export interface Birdhouse {
	name: string;
	aliases: string[];
	huntLvl: number;
	huntXP: number;
	craftLvl: number;
	craftXP: number;
	birdhouseItem: EItem;
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
		birdhouseItem: EItem.BIRD_HOUSE,
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
		birdhouseItem: EItem.OAK_BIRD_HOUSE,
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
		birdhouseItem: EItem.WILLOW_BIRD_HOUSE,
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
		birdhouseItem: EItem.TEAK_BIRD_HOUSE,
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
		birdhouseItem: EItem.MAPLE_BIRD_HOUSE,
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
		birdhouseItem: EItem.MAHOGANY_BIRD_HOUSE,
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
		birdhouseItem: EItem.YEW_BIRD_HOUSE,
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
		birdhouseItem: EItem.MAGIC_BIRD_HOUSE,
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
		birdhouseItem: EItem.REDWOOD_BIRD_HOUSE,
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
		item: Items.getOrThrow('Hammerstone seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Asgarnian seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Barley seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Yanillian seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Krandorian seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Wildblood seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Potato seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Onion seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Cabbage seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Tomato seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Sweetcorn seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Strawberry seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Watermelon seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Marigold seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Rosemary seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Nasturtium seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Woad seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Limpwurt seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Marrentill seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Guam seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Tarromin seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Harralander seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Jute seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('White lily seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Snape grass seed'),
		amount: 10
	},
	{
		item: Items.getOrThrow('Irit seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Dwarf weed seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Kwuarm seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Cadantine seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Lantadyme seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Avantoe seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Toadflax seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Ranarr seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Snapdragon seed'),
		amount: 5
	},
	{
		item: Items.getOrThrow('Torstol seed'),
		amount: 5
	}
];

export default birdhouses;
