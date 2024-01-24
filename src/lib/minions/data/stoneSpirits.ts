import { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from '../../util/getOSItem';

export interface StoneSpirit {
	spirit: Item;
	ore: Item;
}

export const stoneSpirits: StoneSpirit[] = [
	{
		spirit: getOSItem('Copper stone spirit'),
		ore: getOSItem('Copper ore')
	},
	{
		spirit: getOSItem('Tin stone spirit'),
		ore: getOSItem('Tin ore')
	},
	{
		spirit: getOSItem('Iron stone spirit'),
		ore: getOSItem('Iron ore')
	},
	{
		spirit: getOSItem('Coal stone spirit'),
		ore: getOSItem('Coal')
	},
	{
		spirit: getOSItem('Silver stone spirit'),
		ore: getOSItem('Silver ore')
	},
	{
		spirit: getOSItem('Mithril stone spirit'),
		ore: getOSItem('Mithril ore')
	},
	{
		spirit: getOSItem('Adamantite stone spirit'),
		ore: getOSItem('Adamantite ore')
	},
	{
		spirit: getOSItem('Gold stone spirit'),
		ore: getOSItem('Gold ore')
	},
	{
		spirit: getOSItem('Runite stone spirit'),
		ore: getOSItem('Runite ore')
	}
];
