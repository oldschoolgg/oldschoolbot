import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

const baseBank = () => new Bank().add('Marble block').add('Gold leaf');

const MountedCapes: PoHObject[] = [
	{
		id: 29_169,
		name: 'Mounted fire cape',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fire cape')
	},
	{
		id: 30_403,
		name: "Mounted Champion's cape",
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add("Champion's cape")
	},
	{
		id: 31_983,
		name: 'Mounted Mythical Cape',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Mythical Cape')
	},

	// Skilling Capes
	{
		id: 29_180,
		name: 'Mounted Agility Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Agility cape')
	},
	{
		id: 29_181,
		name: 'Mounted Agility Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Agility cape (t)')
	},
	{
		id: 29_182,
		name: 'Mounted Attack Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Attack cape')
	},
	{
		id: 29_183,
		name: 'Mounted Attack Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Attack cape(t)')
	},
	{
		id: 29_184,
		name: 'Mounted Construction Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Construct. cape')
	},
	{
		id: 29_185,
		name: 'Mounted Construction Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Construct. cape(t)')
	},
	{
		id: 29_186,
		name: 'Mounted Cooking Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Cooking cape')
	},
	{
		id: 29_187,
		name: 'Mounted Cooking Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Cooking cape(t)')
	},
	{
		id: 29_188,
		name: 'Mounted Crafting Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Crafting cape')
	},
	{
		id: 29_189,
		name: 'Mounted Crafting Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Crafting cape(t)')
	},
	{
		id: 29_190,
		name: 'Mounted Defence Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Defence cape')
	},
	{
		id: 29_191,
		name: 'Mounted Defence Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Defence cape(t)')
	},
	{
		id: 29_192,
		name: 'Mounted Farming Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Farming cape')
	},
	{
		id: 29_193,
		name: 'Mounted Farming Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Farming cape(t)')
	},
	{
		id: 29_194,
		name: 'Mounted Firemaking Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Firemaking cape')
	},
	{
		id: 29_195,
		name: 'Mounted Firemaking Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Firemaking cape(t)')
	},
	{
		id: 29_196,
		name: 'Mounted Fishing Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fishing cape')
	},
	{
		id: 29_197,
		name: 'Mounted Fishing Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fishing cape(t)')
	},
	{
		id: 29_198,
		name: 'Mounted Fletching Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fletching cape')
	},
	{
		id: 29_199,
		name: 'Mounted Fletching Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Fletching cape(t)')
	},
	{
		id: 29_200,
		name: 'Mounted Herblore Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Herblore cape')
	},
	{
		id: 29_201,
		name: 'Mounted Herblore Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Herblore cape(t)')
	},
	{
		id: 29_202,
		name: 'Mounted Hitpoints Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Hitpoints cape')
	},
	{
		id: 29_203,
		name: 'Mounted Hitpoints Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Hitpoints cape(t)')
	},
	{
		id: 29_204,
		name: 'Mounted Hunter Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Hunter cape')
	},
	{
		id: 29_205,
		name: 'Mounted Hunter Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Hunter cape(t)')
	},
	{
		id: 29_206,
		name: 'Mounted Magic Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Magic cape')
	},
	{
		id: 29_207,
		name: 'Mounted Magic Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Magic cape(t)')
	},
	{
		id: 29_208,
		name: 'Mounted Mining Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Mining cape')
	},
	{
		id: 29_209,
		name: 'Mounted Mining Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Mining cape(t)')
	},
	{
		id: 29_210,
		name: 'Mounted Prayer Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Prayer cape')
	},
	{
		id: 29_211,
		name: 'Mounted Prayer Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Prayer cape(t)')
	},
	{
		id: 29_212,
		name: 'Mounted Ranging Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Ranging cape')
	},
	{
		id: 29_213,
		name: 'Mounted Ranging Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Ranging cape(t)')
	},
	{
		id: 29_214,
		name: 'Mounted Runecraft Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Runecraft cape')
	},
	{
		id: 29_215,
		name: 'Mounted Runecraft Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Runecraft cape(t)')
	},
	{
		id: 29_216,
		name: 'Mounted Slayer Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Slayer cape')
	},
	{
		id: 29_217,
		name: 'Mounted Slayer Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Slayer cape(t)')
	},
	{
		id: 29_218,
		name: 'Mounted Smithing Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Smithing cape')
	},
	{
		id: 29_219,
		name: 'Mounted Smithing Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Smithing cape(t)')
	},
	{
		id: 29_220,
		name: 'Mounted Strength Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Strength cape')
	},
	{
		id: 29_221,
		name: 'Mounted Strength Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Strength cape(t)')
	},
	{
		id: 29_222,
		name: 'Mounted Thieving Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Thieving cape')
	},
	{
		id: 29_223,
		name: 'Mounted Thieving Cape (t)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Thieving cape(t)')
	},
	{
		id: 29_224,
		name: 'Mounted Woodcutting Cape (u)',
		slot: 'mountedCape',
		level: 80,
		itemCost: baseBank().add('Woodcutting cape')
	},
	{
		id: 29_225,
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
