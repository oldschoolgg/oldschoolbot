import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const Crush: Mixable[] = [
	{
		name: 'Unicorn horn dust',
		aliases: ['Unicorn horn dust', 'Unicorn horn'],
		id: itemID('Unicorn horn dust'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Unicorn horn': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.17,
		wesley: true
	},
	{
		name: 'Chocolate dust',
		aliases: ['Chocolate dust', 'Chocolate', 'Chocolate bar'],
		id: itemID('Chocolate dust'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Chocolate bar': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.17,
		wesley: true
	},
	{
		name: 'Kebbit teeth dust',
		aliases: ['kebbit teeth', 'kebbit teeth dust'],
		id: itemID('Kebbit teeth dust'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Kebbit teeth': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.17,
		wesley: true
	},
	{
		name: 'Crushed nest',
		aliases: ['Crushed nest', 'Nest', 'Bird nest', 'Birds nest'],
		id: itemID('Crushed nest'),
		level: 1,
		xp: 0,
		inputItems: { 5075: 1 },
		tickRate: 2,
		bankTimePerPotion: 0.17,
		wesley: true
	},
	{
		name: 'Goat horn dust',
		aliases: ['Goat horn dust', 'Goat', 'Goat horn', 'desert goat horn'],
		id: itemID('Goat horn dust'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Desert goat horn': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.17,
		wesley: true
	},
	{
		name: 'Crushed superior dragon bones',
		aliases: [
			'Crushed superior dragon bones',
			'superior dragon bones',
			'superior dragon',
			'superior dragon bone',
			'Crushed superior dragon bone'
		],
		id: itemID('Crushed superior dragon bones'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Superior dragon bones': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.17,
		wesley: true
	},
	{
		name: 'Dragon scale dust',
		aliases: ['Dragon scale dust', 'Dragon scale'],
		id: itemID('Dragon scale dust'),
		level: 1,
		xp: 0,
		inputItems: resolveNameBank({ 'Blue dragon scale': 1 }),
		tickRate: 2,
		bankTimePerPotion: 0.17,
		wesley: true
	}
];

export default Crush;
