import { Bank } from 'oldschooljs';

import getOSItem from '../../../../util/getOSItem';
import type { Mixable } from '../../../types';

const Crush: Mixable[] = [
	{
		item: getOSItem('Unicorn horn dust'),
		aliases: ['unicorn horn dust', 'unicorn horn'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Unicorn horn': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		item: getOSItem('Chocolate dust'),
		aliases: ['chocolate dust', 'chocolate', 'chocolate bar'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Chocolate bar': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		item: getOSItem('Kebbit teeth dust'),
		aliases: ['kebbit teeth', 'kebbit teeth dust'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Kebbit teeth': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		item: getOSItem('Crushed nest'),
		aliases: ['crushed nest', 'nest', 'bird nest', 'birds nest'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 5075: 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		item: getOSItem('Goat horn dust'),
		aliases: ['goat horn dust', 'goat', 'goat horn', 'desert goat horn'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Desert goat horn': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		item: getOSItem('Silver dust'),
		aliases: ['silver dust', 'silver'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Silver bar': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: false
	},
	{
		item: getOSItem('Crushed superior dragon bones'),
		aliases: [
			'crushed superior dragon bones',
			'superior dragon bones',
			'superior dragon',
			'superior dragon bone',
			'crushed superior dragon bone'
		],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Superior dragon bones': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		item: getOSItem('Dragon scale dust'),
		aliases: ['dragon scale dust', 'dragon scale', 'blue dragon scale'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Blue dragon scale': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		item: getOSItem('Lava scale shard'),
		aliases: ['lava dragon scale', 'lava dragon dust', 'lava dragon', 'lava shard'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Lava scale': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	},
	{
		item: getOSItem('Nihil Dust'),
		aliases: ['nihil dust', 'nihil shard', 'nihil'],
		level: 1,
		xp: 0,
		inputItems: new Bank({ 'Nihil shard': 1 }),
		tickRate: 1,
		bankTimePerPotion: 0,
		wesley: true
	}
];

export default Crush;
