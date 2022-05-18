import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const ThrowingAxe: DisassemblySourceGroup = {
	name: 'ThrowingAxe',
	items: [
		{ item: i('Toktz-xil-ul'), lvl: 60 },
		{ item: i("Morrigan's throwing axe"), lvl: 78 }
	],
	parts: { simple: 35, sharp: 30, plated: 30, swift: 2 }
};
