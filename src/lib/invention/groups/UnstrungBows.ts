import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const UnstrungBows: DisassemblySourceGroup = {
	name: 'UnstrungBows',
	items: [
		{ item: i('Oak shortbow (u)'), lvl: 20 },
		{ item: i('Oak longbow (u)'), lvl: 25 },
		{ item: i('Willow shortbow (u)'), lvl: 35 },
		{ item: i('Willow longbow (u)'), lvl: 40 },
		{ item: i('Maple shortbow (u)'), lvl: 50 },
		{ item: i('Maple longbow (u)'), lvl: 55 },
		{ item: i('Yew shortbow (u)'), lvl: 65 },
		{ item: i('Yew longbow (u)'), lvl: 70 },
		{ item: i('Magic shortbow (u)'), lvl: 80 },
		{ item: i('Magic longbow (u)'), lvl: 85 },
		{ item: i('Elder bow (u)'), lvl: 105 }
	],
	parts: { flexible: 5, dextrous: 5, simple: 20 }
};
