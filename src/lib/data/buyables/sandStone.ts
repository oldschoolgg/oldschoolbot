import { resolveNameBank } from 'oldschooljs/dist/util';
import itemID from '../../util/itemID';
import { Buyable } from './buyables';

export const sandStone: Buyable[] = [
	{
		name: 'Sand 10kg',
		itemCost: resolveNameBank({
			'Sandstone (10kg)': 1,
			'Bucket': 8
		}),
		outputItems: {
			[itemID('Bucket of sand')]: 8
		},
		gpCost: 400
	},
	{
		name: 'Sand 5kg',
		itemCost: resolveNameBank({
			'Sandstone (5kg)': 1,
			'Bucket': 4
		}),
		outputItems: {
			[itemID('Bucket of sand')]: 4
		},
		gpCost: 200
	},
	{
		name: 'Sand 2kg',
		itemCost: resolveNameBank({
			'Sandstone (2kg)': 1,
			'Bucket': 2
		}),
		outputItems: {
			[itemID('Bucket of sand')]: 2
		},
		gpCost: 100
	},
	{
		name: 'Sand 1kg',
		itemCost: resolveNameBank({
			'Sandstone (1kg)': 1,
			'Bucket': 1
		}),
		outputItems: {
			[itemID('Bucket of sand')]: 1
		},
		gpCost: 50
	}
];
