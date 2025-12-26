import { Bank, Items } from 'oldschooljs';

import type { Mixable } from '@/lib/skilling/types.js';

export const bsoGrimy: Mixable[] = [
	{
		item: Items.getOrThrow('Korulsi'),
		aliases: ['grimy korulsi', 'korulsi'],
		level: 110,
		xp: 25,
		inputItems: new Bank({ 'Grimy korulsi': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	},
	{
		item: Items.getOrThrow('Spirit weed'),
		aliases: ['grimy spirit weed'],
		level: 105,
		xp: 25,
		inputItems: new Bank({ 'Grimy spirit weed': 1 }),
		tickRate: 0.5,
		bankTimePerPotion: 0.15,
		zahur: true
	}
];
