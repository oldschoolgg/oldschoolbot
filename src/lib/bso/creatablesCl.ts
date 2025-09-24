import { uniqueArr } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { isFunction } from 'remeda';

import { allDyedItems } from '@/lib/bso/dyedItems.js';
import { discontinuedItems } from '@/lib/customItems/customItems.js';
import Createables from '@/lib/data/createables.js';

export const creatablesCL = uniqueArr(
	Createables.filter(i => i.noCl !== true && i.noCreatablesCl !== true)
		.flatMap(i => (isFunction(i.outputItems) ? [] : new Bank(i.outputItems).items().map(i => i[0].id)))
		.filter(i => !discontinuedItems.includes(i) && !allDyedItems.includes(i))
);
