import type { Item } from 'oldschooljs';
import getOSItem from '../util/getOSItem';

interface RawLeagueBuyable {
	item: Item;
	price: number;
}

// 1 = 500
const twistedBuyables: RawLeagueBuyable[] = [
	{
		item: getOSItem('Twisted cane'),
		price: 2
	},
	{
		item: getOSItem('Twisted banner'),
		price: 1.5
	},
	{
		item: getOSItem('Twisted teleport scroll'),
		price: 1.5
	},
	{
		item: getOSItem('Twisted blueprints'),
		price: 8
	},
	{
		item: getOSItem('Twisted horns'),
		price: 12
	},
	{
		item: getOSItem('Twisted relic hunter (t1) armour set'),
		price: 2
	},
	{
		item: getOSItem('Twisted relic hunter (t2) armour set'),
		price: 5
	},
	{
		item: getOSItem('Twisted relic hunter (t3) armour set'),
		price: 20
	}
];

const trailblazerBuyables: RawLeagueBuyable[] = [
	{
		item: getOSItem('Trailblazer cane'),
		price: 2
	},
	{
		item: getOSItem('Trailblazer banner'),
		price: 1
	},
	{
		item: getOSItem('Trailblazer teleport scroll'),
		price: 2
	},
	{
		item: getOSItem('Trailblazer tool ornament kit'),
		price: 3
	},
	{
		item: getOSItem('Trailblazer globe'),
		price: 8
	},
	{
		item: getOSItem('Trailblazer rug'),
		price: 10
	},
	{
		item: getOSItem('Trailblazer graceful ornament kit'),
		price: 2
	},
	{
		item: getOSItem('Trailblazer relic hunter (t1) armour set'),
		price: 2
	},
	{
		item: getOSItem('Trailblazer relic hunter (t2) armour set'),
		price: 6
	},
	{
		item: getOSItem('Trailblazer relic hunter (t3) armour set'),
		price: 30
	}
];

const shatteredRelicsBuyables: RawLeagueBuyable[] = [
	{
		item: getOSItem('Shattered cane'),
		price: 2
	},
	{
		item: getOSItem('Shattered banner'),
		price: 1
	},
	{
		item: getOSItem('Shattered teleport scroll'),
		price: 2
	},
	{
		item: getOSItem('Shattered relics variety ornament kit'),
		price: 3
	},
	{
		item: getOSItem('Shattered relics void ornament kit'),
		price: 2
	},
	{
		item: getOSItem('Shattered relics mystic ornament kit'),
		price: 1
	},
	{
		item: getOSItem('Shattered cannon ornament kit'),
		price: 2
	},
	{
		item: getOSItem('Shattered relic hunter (t1) armour set'),
		price: 2
	},
	{
		item: getOSItem('Shattered relic hunter (t2) armour set'),
		price: 6
	},
	{
		item: getOSItem('Shattered relic hunter (t3) armour set'),
		price: 30
	}
];

export const leagueBuyables = [...twistedBuyables, ...trailblazerBuyables, ...shatteredRelicsBuyables];
