import { Bank } from 'oldschooljs';

import getOSItem from '../../../../util/getOSItem';
import type { Mixable } from '../../../types';

const Tar: Mixable[] = [
	{
		item: getOSItem('Guam tar'),
		aliases: ['guam tar'],
		level: 19,
		xp: 30,
		inputItems: new Bank({ 'Guam leaf': 1, 'Swamp tar': 15 }),
		tickRate: 3,
		bankTimePerPotion: 0.17,
		outputMultiple: 15
	},
	{
		item: getOSItem('Marrentill tar'),
		aliases: ['marrentill tar'],
		level: 31,
		xp: 42.5,
		inputItems: new Bank({ Marrentill: 1, 'Swamp tar': 15 }),
		tickRate: 3,
		bankTimePerPotion: 0.17,
		outputMultiple: 15
	},
	{
		item: getOSItem('Tarromin tar'),
		aliases: ['tarromin tar'],
		level: 39,
		xp: 55,
		inputItems: new Bank({ Tarromin: 1, 'Swamp tar': 15 }),
		tickRate: 3,
		bankTimePerPotion: 0.17,
		outputMultiple: 15
	},
	{
		item: getOSItem('Harralander tar'),
		aliases: ['harralander tar'],
		level: 44,
		xp: 72.5,
		inputItems: new Bank({ Harralander: 1, 'Swamp tar': 15 }),
		tickRate: 3,
		bankTimePerPotion: 0.17,
		outputMultiple: 15
	}
];

export default Tar;
