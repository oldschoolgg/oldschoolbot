import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const Crush: Mixable[] = [
	{
		name: 'Unicorn horn dust',
		aliases: ['unicorn horn dust', 'unicorn horn'],
		id: itemID('Unicorn horn dust'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Unicorn horn': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		name: 'Chocolate dust',
		aliases: ['chocolate dust', 'chocolate', 'chocolate bar'],
		id: itemID('Chocolate dust'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Chocolate bar': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		name: 'Kebbit teeth dust',
		aliases: ['kebbit teeth', 'kebbit teeth dust'],
		id: itemID('Kebbit teeth dust'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Kebbit teeth': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		name: 'Crushed nest',
		aliases: ['crushed nest', 'nest', 'bird nest', 'birds nest'],
		id: itemID('Crushed nest'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 5075: 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		name: 'Goat horn dust',
		aliases: ['goat horn dust', 'goat', 'goat horn', 'desert goat horn'],
		id: itemID('Goat horn dust'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Desert goat horn': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		name: 'Silver dust',
		aliases: ['silver dust', 'silver'],
		id: itemID('Silver dust'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Silver bar': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: false
	},
	{
		name: 'Crushed superior dragon bones',
		aliases: [
			'crushed superior dragon bones',
			'superior dragon bones',
			'superior dragon',
			'superior dragon bone',
			'crushed superior dragon bone'
		],
		id: itemID('Crushed superior dragon bones'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Superior dragon bones': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		name: 'Dragon scale dust',
		aliases: ['dragon scale dust', 'dragon scale', 'blue dragon scale'],
		id: itemID('Dragon scale dust'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Blue dragon scale': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		name: 'Athelas paste',
		aliases: ['athelas paste', 'athelas'],
		id: itemID('Athelas paste'),
		level: 82,
		xp: 10,
		inputItems: new Bank({ Athelas: 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.17,
		wesley: false,
		outputMultiple: 2
	},
	{
		name: 'Nihil Dust',
		aliases: ['nihil dust', 'nihil shard', 'nihil'],
		id: itemID('Nihil dust'),
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Nihil shard': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	}
];

export default Crush;
