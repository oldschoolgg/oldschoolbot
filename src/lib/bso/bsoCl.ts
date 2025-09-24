import { uniqueArr } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { isFunction } from 'remeda';

import { allDyedItems } from '@/lib/bso/dyedItems.js';
import { discontinuedItems, removeDiscontinuedItems } from '@/lib/customItems/customItems.js';
import Createables from '@/lib/data/createables.js';
import { Cookables } from '@/lib/skilling/skills/cooking/cooking.js';
import Crafting from '@/lib/skilling/skills/crafting/index.js';
import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import Smithing from '@/lib/skilling/skills/smithing/index.js';

export const herbloreCL = removeDiscontinuedItems(Herblore.Mixables.map(i => i.item.id));
export const cookingCL = removeDiscontinuedItems(Cookables.map(i => i.id));
export const craftingCL = removeDiscontinuedItems(Crafting.Craftables.map(i => i.id));
export const smithingCL = removeDiscontinuedItems(Smithing.SmithableItems.map(i => i.id));

export const creatablesCL = uniqueArr(
	Createables.filter(i => i.noCl !== true && i.noCreatablesCl !== true)
		.flatMap(i => (isFunction(i.outputItems) ? [] : new Bank(i.outputItems).items().map(i => i[0].id)))
		.filter(i => !discontinuedItems.includes(i) && !allDyedItems.includes(i))
);
