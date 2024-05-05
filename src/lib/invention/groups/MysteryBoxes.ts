import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MysteryBoxes: DisassemblySourceGroup = {
	name: 'Mystery Boxes',
	description: 'Mystery boxes!',
	items: [
		{ item: i('Tradeable Mystery box'), lvl: 99 },
		{ item: i('Untradeable Mystery box'), lvl: 99 },
		{ item: i('Equippable Mystery box'), lvl: 99 },
		{ item: i('Clothing Mystery box'), lvl: 99 },
		{ item: i('Pet Mystery box'), lvl: 99 }
	],
	parts: { mysterious: 100 }
};
