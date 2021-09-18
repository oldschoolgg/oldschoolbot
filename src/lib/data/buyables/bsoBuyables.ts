import { resolveNameBank } from '../../util';
import { Buyable } from './buyables';

const items = [
	['Castle wars cape (beginner)', 100],
	['Castle wars cape (intermediate)', 500],
	['Castle wars cape (advanced)', 1000],
	['Castle wars cape (expert)', 2500],
	['Castle wars cape (legend)', 5000]
] as const;

export const castleWarsBuyables: Buyable[] = items.map(i => ({
	name: i[0],
	outputItems: resolveNameBank({
		[i[0]]: 1
	}),
	itemCost: resolveNameBank({
		'Castle wars ticket': i[1]
	})
}));
