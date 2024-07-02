import { Time } from 'e';
import { Bank } from 'oldschooljs';

import itemID from '../../../util/itemID';
import type { Bar } from '../../types';

const Bars: Bar[] = [
	{
		name: 'Bronze bar',
		level: 1,
		xp: 6.2,
		id: itemID('Bronze bar'),
		inputOres: new Bank({ 'Copper ore': 1, 'Tin ore': 1 }),
		chanceOfFail: 0,
		timeToUse: Time.Second * 2.4
	},
	{
		name: 'Iron bar',
		level: 15,
		xp: 12.5,
		id: itemID('Iron bar'),
		inputOres: new Bank({ 'Iron ore': 1 }),
		chanceOfFail: 50,
		timeToUse: Time.Second * 2.4
	},
	{
		name: 'Silver bar',
		level: 20,
		xp: 13.6,
		id: itemID('Silver bar'),
		inputOres: new Bank({ 'Silver ore': 1 }),
		chanceOfFail: 0,
		timeToUse: Time.Second * 2.4
	},
	{
		name: 'Steel bar',
		level: 30,
		xp: 17.5,
		id: itemID('Steel bar'),
		inputOres: new Bank({ 'Iron ore': 1, Coal: 2 }),
		chanceOfFail: 0,
		timeToUse: Time.Second * 2.4
	},
	{
		name: 'Gold bar',
		level: 40,
		xp: 22.5,
		id: itemID('Gold bar'),
		inputOres: new Bank({ 'Gold ore': 1 }),
		chanceOfFail: 0,
		timeToUse: Time.Second * 2.4
	},
	{
		name: 'Mithril bar',
		level: 50,
		xp: 30,
		id: itemID('Mithril bar'),
		inputOres: new Bank({ 'Mithril ore': 1, Coal: 4 }),
		chanceOfFail: 0,
		timeToUse: Time.Second * 2.4
	},
	{
		name: 'Adamantite bar',
		level: 70,
		xp: 37.5,
		id: itemID('Adamantite bar'),
		inputOres: new Bank({ 'Adamantite ore': 1, Coal: 6 }),
		chanceOfFail: 0,
		timeToUse: Time.Second * 2.4
	},
	{
		name: 'Runite bar',
		level: 85,
		xp: 50,
		id: itemID('Runite bar'),
		inputOres: new Bank({ 'Runite ore': 1, Coal: 8 }),
		chanceOfFail: 0,
		timeToUse: Time.Second * 2.4
	}
];

export default Bars;
