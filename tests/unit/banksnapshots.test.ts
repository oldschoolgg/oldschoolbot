import { isFunction } from 'e';
import { Bank } from 'oldschooljs';
import { expect, it } from 'vitest';

import { BOT_TYPE } from '../../src/lib/constants';
import Buyables from '../../src/lib/data/buyables/buyables';
import Createables from '../../src/lib/data/createables';
import { mockMUser } from './userutil';

it(`${BOT_TYPE} Creatables`, () => {
	const result = Createables.sort((a, b) => a.name.localeCompare(b.name)).map(i => ({
		...i,
		inputItems: isFunction(i.inputItems) ? 'function' : new Bank(i.inputItems),
		outputItems: isFunction(i.outputItems) ? 'function' : new Bank(i.outputItems),
		cantHaveItems: i.cantHaveItems ? new Bank(i.cantHaveItems) : undefined
	}));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Buyables`, () => {
	const result = Buyables.sort((a, b) => a.name.localeCompare(b.name)).map(i => ({
		...i,
		itemCost: new Bank(i.itemCost),
		outputItems: !i.outputItems
			? i.name
			: i.outputItems instanceof Bank
				? i.outputItems
				: i.outputItems(mockMUser())
	}));
	expect(result).toMatchSnapshot();
});
