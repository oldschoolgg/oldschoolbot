import itemID from '../../util/itemID';

export const pickaxes = [
	{
		id: itemID('Crystal pickaxe'),
		ticksBetweenRolls: 2.75,
		miningLvl: 71
	},
	{
		id: itemID('Infernal pickaxe'),
		ticksBetweenRolls: 2.83,
		miningLvl: 61
	},
	{
		id: itemID('Dragon pickaxe'),
		ticksBetweenRolls: 2.83,
		miningLvl: 61
	},
	{
		id: itemID('Rune pickaxe'),
		ticksBetweenRolls: 3,
		miningLvl: 41
	},
	{
		id: itemID('Adamant pickaxe'),
		ticksBetweenRolls: 4,
		miningLvl: 31
	},
	{
		id: itemID('Mithril pickaxe'),
		ticksBetweenRolls: 5,
		miningLvl: 21
	},
	{
		id: itemID('Black pickaxe'),
		ticksBetweenRolls: 5,
		miningLvl: 11
	},
	{
		id: itemID('Steel pickaxe'),
		ticksBetweenRolls: 6,
		miningLvl: 6
	},
	{
		id: itemID('Iron pickaxe'),
		ticksBetweenRolls: 7,
		miningLvl: 1
	},
	{
		id: itemID('Bronze pickaxe'),
		ticksBetweenRolls: 8,
		miningLvl: 1
	}
];

export const miningGloves: { id: number; Depletions: Record<string, number> }[] = [
	{
		id: itemID('Expert mining gloves'),
		Depletions: {
			'Iron ore': 3,
			'Silver ore': 3,
			Coal: 3,
			Sandstone: 1,
			'Gold ore': 3,
			'Mithril ore': 2,
			'Adamantite ore': 2,
			'Runite ore': 1,
			Amethyst: 1
		}
	},
	{
		id: itemID('Superior mining gloves'),
		Depletions: {
			'Iron ore': 2,
			'Silver ore': 2,
			Coal: 2,
			Sandstone: 0,
			'Gold ore': 2,
			'Mithril ore': 1,
			'Adamantite ore': 1,
			'Runite ore': 0,
			Amethyst: 0
		}
	},
	{
		id: itemID('Mining gloves'),
		Depletions: {
			'Iron ore': 1,
			'Silver ore': 1,
			Coal: 1,
			Sandstone: 0,
			'Gold ore': 1,
			'Mithril ore': 0,
			'Adamantite ore': 0,
			'Runite ore': 0,
			Amethyst: 0
		}
	}
];

export const varrockArmours: { id: number; Percentages: Record<string, number> }[] = [
	{
		id: itemID('Varrock armour 4'),
		Percentages: {
			Clay: 10,
			'Copper ore': 10,
			'Tin ore': 10,
			'Iron ore': 10,
			'Silver ore': 10,
			Coal: 10,
			Sandstone: 10,
			'Gold ore': 10,
			Granite: 10,
			'Mithril ore': 10,
			'Adamantite ore': 10,
			'Runite ore': 10,
			Amethyst: 10
		}
	},
	{
		id: itemID('Varrock armour 3'),
		Percentages: {
			Clay: 10,
			'Copper ore': 10,
			'Tin ore': 10,
			'Iron ore': 10,
			'Silver ore': 10,
			Coal: 10,
			Sandstone: 10,
			'Gold ore': 10,
			Granite: 10,
			'Mithril ore': 10,
			'Adamantite ore': 10,
			'Runite ore': 0,
			Amethyst: 0
		}
	},
	{
		id: itemID('Varrock armour 2'),
		Percentages: {
			Clay: 10,
			'Copper ore': 10,
			'Tin ore': 10,
			'Iron ore': 10,
			'Silver ore': 10,
			Coal: 10,
			Sandstone: 10,
			'Gold ore': 10,
			Granite: 10,
			'Mithril ore': 10,
			'Adamantite ore': 0,
			'Runite ore': 0,
			Amethyst: 0
		}
	},
	{
		id: itemID('Varrock armour 1'),
		Percentages: {
			Clay: 10,
			'Copper ore': 10,
			'Tin ore': 10,
			'Iron ore': 10,
			'Silver ore': 10,
			Coal: 10,
			'Sandstone)': 0,
			'Gold ore': 10,
			Granite: 0,
			'Mithril ore': 0,
			'Adamantite ore': 0,
			'Runite ore': 0,
			Amethyst: 0
		}
	}
];

export const miningCapeOreEffect: Record<string, number> = {
	Clay: 5,
	'Copper ore': 5,
	'Tin ore': 5,
	'Iron ore': 5,
	'Silver ore': 5,
	Coal: 5,
	Sandstone: 5,
	'Gold ore': 5,
	Granite: 5,
	'Mithril ore': 5,
	'Adamantite ore': 5,
	'Runite ore': 0,
	Amethyst: 0
};
