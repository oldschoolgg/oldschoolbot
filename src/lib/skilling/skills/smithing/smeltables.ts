import itemID from '../../../util/itemID';
import { Bar } from '../../types';

const Bars: Bar[] = [
	{
		name: 'Bronze bar',
		level: 1,
		xp: 6.2,
		id: itemID('Bronze bar'),
		inputOres: { [itemID('Copper ore')]: 1, [itemID('Tin ore')]: 1 },
		chanceOfFail: 0
	},
	{
		name: 'Iron bar',
		level: 15,
		xp: 12.5,
		id: itemID('Iron bar'),
		inputOres: { [itemID('Iron ore')]: 1 },
		chanceOfFail: 50
	},
	{
		name: 'Silver bar',
		level: 20,
		xp: 13.6,
		id: itemID('Silver bar'),
		inputOres: { [itemID('Silver ore')]: 1 },
		chanceOfFail: 0
	},
	{
		name: 'Steel bar',
		level: 30,
		xp: 17.5,
		id: itemID('Steel bar'),
		inputOres: { [itemID('Iron ore')]: 1, [itemID('Coal')]: 2 },
		chanceOfFail: 0
	},
	{
		name: 'Gold bar',
		level: 40,
		xp: 22.5,
		id: itemID('Gold bar'),
		inputOres: { [itemID('Gold ore')]: 1 },
		chanceOfFail: 0
	},
	{
		name: 'Mithril bar',
		level: 50,
		xp: 30,
		id: itemID('Mithril bar'),
		inputOres: { [itemID('Mithril ore')]: 1, [itemID('Coal')]: 4 },
		chanceOfFail: 0
	},
	{
		name: 'Adamantite bar',
		level: 70,
		xp: 37.5,
		id: itemID('Adamantite bar'),
		inputOres: { [itemID('Adamantite ore')]: 1, [itemID('Coal')]: 6 },
		chanceOfFail: 0
	},
	{
		name: 'Runite bar',
		level: 85,
		xp: 50,
		id: itemID('Runite bar'),
		inputOres: { [itemID('Runite ore')]: 1, [itemID('Coal')]: 8 },
		chanceOfFail: 0
	},
	{
		name: 'Dwarven bar',
		level: 99,
		xp: 5000,
		id: itemID('Dwarven bar'),
		inputOres: { [itemID('Dwarven ore')]: 1, [itemID('Coal')]: 20 },
		chanceOfFail: 35
	}
];

export default Bars;
