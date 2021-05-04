import { Time } from 'e';

import itemID from '../../../util/itemID';
import { BlastableBar } from '../../types';

const BlastableBars: BlastableBar[] = [
	{
		name: 'Bronze bar',
		level: 1,
		xp: 6.2,
		id: itemID('Bronze bar'),
		inputOres: { [itemID('Copper ore')]: 1, [itemID('Tin ore')]: 1 },
		timeToUse: Time.Second * 1.05
	},
	{
		name: 'Iron bar',
		level: 15,
		xp: 12.5,
		id: itemID('Iron bar'),
		inputOres: { [itemID('Iron ore')]: 1 },
		timeToUse: Time.Second * 0.47
	},
	{
		name: 'Silver bar',
		level: 20,
		xp: 13.6,
		id: itemID('Silver bar'),
		inputOres: { [itemID('Silver ore')]: 1 },
		timeToUse: Time.Second * 0.47
	},
	{
		name: 'Steel bar',
		level: 30,
		xp: 17.5,
		id: itemID('Steel bar'),
		inputOres: { [itemID('Iron ore')]: 1, [itemID('Coal')]: 1 },
		timeToUse: Number(Time.Second)
	},
	{
		name: 'Gold bar',
		level: 40,
		xp: 22.5,
		id: itemID('Gold bar'),
		inputOres: { [itemID('Gold ore')]: 1 },
		timeToUse: Time.Second * 0.47
	},
	{
		name: 'Mithril bar',
		level: 50,
		xp: 30,
		id: itemID('Mithril bar'),
		inputOres: { [itemID('Mithril ore')]: 1, [itemID('Coal')]: 2 },
		timeToUse: Time.Second * 1.6
	},
	{
		name: 'Adamantite bar',
		level: 70,
		xp: 37.5,
		id: itemID('Adamantite bar'),
		inputOres: { [itemID('Adamantite ore')]: 1, [itemID('Coal')]: 3 },
		timeToUse: Time.Second * 1.8
	},
	{
		name: 'Runite bar',
		level: 85,
		xp: 50,
		id: itemID('Runite bar'),
		inputOres: { [itemID('Runite ore')]: 1, [itemID('Coal')]: 4 },
		timeToUse: Time.Second * 2.6
	}
];

export default BlastableBars;
