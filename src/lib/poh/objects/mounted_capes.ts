import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

const baseBank = () => new Bank().add('Marble block').add('Gold leaf');

const MountedCapes: PoHObject[] = [
	{
		id: 29169,
		name: 'Mounted fire cape',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fire cape')
	},
	{
		id: 30403,
		name: "Mounted Champion's cape",
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add("Champion's cape")
	},
	{
		id: 31983,
		name: 'Mounted Mythical Cape',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Mythical Cape')
	},

	// Skilling Capes
	{
		id: 29180,
		name: 'Mounted Agility Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Agility cape')
	},
	{
		id: 29181,
		name: 'Mounted Agility Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Agility cape (t)')
	},
	{
		id: 29182,
		name: 'Mounted Attack Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Attack cape')
	},
	{
		id: 29183,
		name: 'Mounted Attack Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Attack cape(t)')
	},
	{
		id: 29184,
		name: 'Mounted Construction Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Construct. cape')
	},
	{
		id: 29185,
		name: 'Mounted Construction Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Construct. cape(t)')
	},
	{
		id: 29186,
		name: 'Mounted Cooking Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Cooking cape')
	},
	{
		id: 29187,
		name: 'Mounted Cooking Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Cooking cape(t)')
	},
	{
		id: 29188,
		name: 'Mounted Crafting Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Crafting cape')
	},
	{
		id: 29189,
		name: 'Mounted Crafting Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Crafting cape(t)')
	},
	{
		id: 29190,
		name: 'Mounted Defence Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Defence cape')
	},
	{
		id: 29191,
		name: 'Mounted Defence Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Defence cape(t)')
	},
	{
		id: 29192,
		name: 'Mounted Farming Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Farming cape')
	},
	{
		id: 29193,
		name: 'Mounted Farming Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Farming cape(t)')
	},
	{
		id: 29194,
		name: 'Mounted Firemaking Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Firemaking cape')
	},
	{
		id: 29195,
		name: 'Mounted Firemaking Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Firemaking cape(t)')
	},
	{
		id: 29196,
		name: 'Mounted Fishing Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fishing cape')
	},
	{
		id: 29197,
		name: 'Mounted Fishing Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fishing cape(t)')
	},
	{
		id: 29198,
		name: 'Mounted Fletching Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fletching cape')
	},
	{
		id: 29199,
		name: 'Mounted Fletching Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fletching cape(t)')
	},
	{
		id: 29200,
		name: 'Mounted Herblore Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Herblore cape')
	},
	{
		id: 29201,
		name: 'Mounted Herblore Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Herblore cape(t)')
	},
	{
		id: 29202,
		name: 'Mounted Hitpoints Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Hitpoints cape')
	},
	{
		id: 29203,
		name: 'Mounted Hitpoints Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Hitpoints cape(t)')
	},
	{
		id: 29204,
		name: 'Mounted Hunter Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Hunter cape')
	},
	{
		id: 29205,
		name: 'Mounted Hunter Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Hunter cape(t)')
	},
	{
		id: 29206,
		name: 'Mounted Magic Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Magic cape')
	},
	{
		id: 29207,
		name: 'Mounted Magic Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Magic cape(t)')
	},
	{
		id: 29208,
		name: 'Mounted Mining Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Mining cape')
	},
	{
		id: 29209,
		name: 'Mounted Mining Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Mining cape(t)')
	},
	{
		id: 29210,
		name: 'Mounted Prayer Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Prayer cape')
	},
	{
		id: 29211,
		name: 'Mounted Prayer Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Prayer cape(t)')
	},
	{
		id: 29212,
		name: 'Mounted Ranging Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Ranging cape')
	},
	{
		id: 29213,
		name: 'Mounted Ranging Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Ranging cape(t)')
	},
	{
		id: 29214,
		name: 'Mounted Runecraft Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Runecraft cape')
	},
	{
		id: 29215,
		name: 'Mounted Runecraft Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Runecraft cape(t)')
	},
	{
		id: 29216,
		name: 'Mounted Slayer Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Slayer cape')
	},
	{
		id: 29217,
		name: 'Mounted Slayer Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Slayer cape(t)')
	},
	{
		id: 29218,
		name: 'Mounted Smithing Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Smithing cape')
	},
	{
		id: 29219,
		name: 'Mounted Smithing Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Smithing cape(t)')
	},
	{
		id: 29220,
		name: 'Mounted Strength Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Strength cape')
	},
	{
		id: 29221,
		name: 'Mounted Strength Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Strength cape(t)')
	},
	{
		id: 29222,
		name: 'Mounted Thieving Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Thieving cape')
	},
	{
		id: 29223,
		name: 'Mounted Thieving Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Thieving cape(t)')
	},
	{
		id: 29224,
		name: 'Mounted Woodcutting Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Woodcutting cape')
	},
	{
		id: 29225,
		name: 'Mounted Woodcutting Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Woodcut. cape(t)')
	}
];

for (const obj of MountedCapes) {
	obj.refundItems = true;
}

export { MountedCapes };
