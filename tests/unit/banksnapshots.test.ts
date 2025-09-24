import { Bank } from 'oldschooljs';
import { isFunction } from 'remeda';
import { expect, it } from 'vitest';

import { BOT_TYPE } from '@/lib/constants.js';
import Buyables from '@/lib/data/buyables/buyables.js';
import Createables from '@/lib/data/createables.js';
import { mockMUser } from './userutil.js';

it(`${BOT_TYPE} Creatables`, () => {
	const result = Createables.map(i => ({
		...i,
		inputItems: isFunction(i.inputItems) ? 'function' : new Bank(i.inputItems),
		outputItems: isFunction(i.outputItems) ? 'function' : new Bank(i.outputItems),
		cantHaveItems: i.cantHaveItems ? new Bank(i.cantHaveItems) : undefined
	}));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Buyables`, () => {
	const result = Buyables.map(i => ({
		...i,
		itemCost: new Bank(i.itemCost),
		outputItems: !i.outputItems
			? undefined
			: i.outputItems instanceof Bank
				? i.outputItems
				: i.outputItems(mockMUser())
	}));
	expect(result).toMatchSnapshot();
});
