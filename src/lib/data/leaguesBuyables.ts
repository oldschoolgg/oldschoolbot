import { type Item, Items } from 'oldschooljs';

interface RawLeagueBuyable {
	item: Item;
	price: number;
}

// 1 = 500
const twistedBuyables: RawLeagueBuyable[] = [
	{
		item: Items.getOrThrow('Twisted cane'),
		price: 2
	},
	{
		item: Items.getOrThrow('Twisted banner'),
		price: 1.5
	},
	{
		item: Items.getOrThrow('Twisted teleport scroll'),
		price: 1.5
	},
	{
		item: Items.getOrThrow('Twisted blueprints'),
		price: 8
	},
	{
		item: Items.getOrThrow('Twisted horns'),
		price: 12
	},
	{
		item: Items.getOrThrow('Twisted relic hunter (t1) armour set'),
		price: 2
	},
	{
		item: Items.getOrThrow('Twisted relic hunter (t2) armour set'),
		price: 5
	},
	{
		item: Items.getOrThrow('Twisted relic hunter (t3) armour set'),
		price: 20
	}
];

const trailblazerBuyables: RawLeagueBuyable[] = [
	{
		item: Items.getOrThrow('Trailblazer cane'),
		price: 2
	},
	{
		item: Items.getOrThrow('Trailblazer banner'),
		price: 1
	},
	{
		item: Items.getOrThrow('Trailblazer teleport scroll'),
		price: 2
	},
	{
		item: Items.getOrThrow('Trailblazer tool ornament kit'),
		price: 3
	},
	{
		item: Items.getOrThrow('Trailblazer globe'),
		price: 8
	},
	{
		item: Items.getOrThrow('Trailblazer rug'),
		price: 10
	},
	{
		item: Items.getOrThrow('Trailblazer graceful ornament kit'),
		price: 2
	},
	{
		item: Items.getOrThrow('Trailblazer relic hunter (t1) armour set'),
		price: 2
	},
	{
		item: Items.getOrThrow('Trailblazer relic hunter (t2) armour set'),
		price: 6
	},
	{
		item: Items.getOrThrow('Trailblazer relic hunter (t3) armour set'),
		price: 30
	}
];

const shatteredRelicsBuyables: RawLeagueBuyable[] = [
	{
		item: Items.getOrThrow('Shattered cane'),
		price: 2
	},
	{
		item: Items.getOrThrow('Shattered banner'),
		price: 1
	},
	{
		item: Items.getOrThrow('Shattered teleport scroll'),
		price: 2
	},
	{
		item: Items.getOrThrow('Shattered relics variety ornament kit'),
		price: 3
	},
	{
		item: Items.getOrThrow('Shattered relics void ornament kit'),
		price: 2
	},
	{
		item: Items.getOrThrow('Shattered relics mystic ornament kit'),
		price: 1
	},
	{
		item: Items.getOrThrow('Shattered cannon ornament kit'),
		price: 2
	},
	{
		item: Items.getOrThrow('Shattered relic hunter (t1) armour set'),
		price: 2
	},
	{
		item: Items.getOrThrow('Shattered relic hunter (t2) armour set'),
		price: 6
	},
	{
		item: Items.getOrThrow('Shattered relic hunter (t3) armour set'),
		price: 30
	}
];

export const leagueBuyables = [...twistedBuyables, ...trailblazerBuyables, ...shatteredRelicsBuyables];
