import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const UnstrungBows: DisassemblySourceGroup = {
	name: 'UnstrungBows',
	items: [
		{ item: i('Oak shortbow (u)'), lvl: 1 },
		{ item: i('Oak longbow (u)'), lvl: 5 },
		{ item: i('Willow shortbow (u)'), lvl: 10 },
		{ item: i('Willow longbow (u)'), lvl: 15 },
		{ item: i('Maple shortbow (u)'), lvl: 25 },
		{ item: i('Maple longbow (u)'), lvl: 30 },
		{ item: i('Yew shortbow (u)'), lvl: 45 },
		{ item: i('Yew longbow (u)'), lvl: 50 },
		{ item: i('Magic shortbow (u)'), lvl: 55 },
		{ item: i('Magic longbow (u)'), lvl: 60 },
		{ item: i('Elder bow (u)'), lvl: 75, outputMultiplier: 5 }
	],
	parts: { flexible: 15, dextrous: 5, simple: 10 }
};
