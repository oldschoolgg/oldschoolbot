import itemID from '../../util/itemID';

export const pickaxes = [
	{
		id: itemID('Volcanic pickaxe'),
		ticksBetweenRolls: 1.24,
		miningLvl: 105
	},
	{
		id: itemID('Dwarven pickaxe'),
		ticksBetweenRolls: 1.5,
		miningLvl: 99
	},
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

export const miningGloves: { id: number; Percentages: Record<string, number> }[] = [
	{
		id: itemID('Expert mining gloves'),
		Percentages: {
			'Silver ore': 50,
			Coal: 40,
			'Gold ore': 33.33,
			'Mithril ore': 25,
			'Adamantite ore': 16.66,
			'Runite ore': 12.5,
			Amethyst: 25
		}
	},
	{
		id: itemID('Superior mining gloves'),
		Percentages: {
			'Silver ore': 0,
			Coal: 0,
			'Gold ore': 0,
			'Mithril ore': 25,
			'Adamantite ore': 16.66,
			'Runite ore': 12.5,
			Amethyst: 0
		}
	},
	{
		id: itemID('Mining gloves'),
		Percentages: {
			'Silver ore': 50,
			Coal: 40,
			'Gold ore': 33.33,
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
			'Sandstone (5kg)': 10,
			'Gold ore': 10,
			'Granite (5kg)': 10,
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
			'Sandstone (5kg)': 10,
			'Gold ore': 10,
			'Granite (5kg)': 10,
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
			'Sandstone (5kg)': 10,
			'Gold ore': 10,
			'Granite (5kg)': 10,
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
			'Sandstone (5kg)': 0,
			'Gold ore': 0,
			'Granite (5kg)': 0,
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
	'Sandstone (5kg)': 5,
	'Gold ore': 5,
	'Granite (5kg)': 5,
	'Mithril ore': 5,
	'Adamantite ore': 5,
	'Runite ore': 0,
	Amethyst: 0
};
