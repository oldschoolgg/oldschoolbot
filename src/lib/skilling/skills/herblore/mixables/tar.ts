import { resolveNameBank } from '../../../../util';
import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

const Tar: Mixable[] = [
	{
		name: 'Guam tar',
		id: itemID('Guam tar'),
		level: 19,
		xp: 30,
		inputItems: resolveNameBank({ 'Guam leaf': 1, 'Swamp tar': 15 }),
		tickRate: 3,
		bankTimePerPotion: 0.17,
		outputMultiple: 15
	},
	{
		name: 'Marrentill tar',
		id: itemID('Marrentill tar'),
		level: 31,
		xp: 42.5,
		inputItems: resolveNameBank({ Marrentill: 1, 'Swamp tar': 15 }),
		tickRate: 3,
		bankTimePerPotion: 0.17,
		outputMultiple: 15
	},
	{
		name: 'Tarromin tar',
		id: itemID('Tarromin tar'),
		level: 39,
		xp: 55,
		inputItems: resolveNameBank({ Tarromin: 1, 'Swamp tar': 15 }),
		tickRate: 3,
		bankTimePerPotion: 0.17,
		outputMultiple: 15
	},
	{
		name: 'Harralander tar',
		id: itemID('Harralander tar'),
		level: 44,
		xp: 72.5,
		inputItems: resolveNameBank({ Harralander: 1, 'Swamp tar': 15 }),
		tickRate: 3,
		bankTimePerPotion: 0.17,
		outputMultiple: 15
	}
];

export default Tar;
