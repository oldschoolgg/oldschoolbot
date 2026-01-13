import { type Item, Items } from 'oldschooljs';

export interface StoneSpirit {
	spirit: Item;
	ore: Item;
}

export const stoneSpirits: StoneSpirit[] = [
	{
		spirit: Items.getOrThrow('Copper stone spirit'),
		ore: Items.getOrThrow('Copper ore')
	},
	{
		spirit: Items.getOrThrow('Tin stone spirit'),
		ore: Items.getOrThrow('Tin ore')
	},
	{
		spirit: Items.getOrThrow('Iron stone spirit'),
		ore: Items.getOrThrow('Iron ore')
	},
	{
		spirit: Items.getOrThrow('Coal stone spirit'),
		ore: Items.getOrThrow('Coal')
	},
	{
		spirit: Items.getOrThrow('Silver stone spirit'),
		ore: Items.getOrThrow('Silver ore')
	},
	{
		spirit: Items.getOrThrow('Mithril stone spirit'),
		ore: Items.getOrThrow('Mithril ore')
	},
	{
		spirit: Items.getOrThrow('Adamantite stone spirit'),
		ore: Items.getOrThrow('Adamantite ore')
	},
	{
		spirit: Items.getOrThrow('Gold stone spirit'),
		ore: Items.getOrThrow('Gold ore')
	},
	{
		spirit: Items.getOrThrow('Runite stone spirit'),
		ore: Items.getOrThrow('Runite ore')
	}
];
