import { Bank } from 'oldschooljs';

import { Buyable } from './buyables';

export const shootingStarsBuyables: Buyable[] = [
	{
		name: 'Celestial ring (uncharged)',
		itemCost: new Bank().add('Stardust', 2000)
	},
	{
		name: 'Star fragment',
		itemCost: new Bank().add('Stardust', 3000)
	},
	{
		name: 'Bag full of gems',
		itemCost: new Bank().add('Stardust', 300)
	},
	{
		name: 'Soft clay pack',
		itemCost: new Bank().add('Stardust', 150)
	}
];
