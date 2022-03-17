import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const ThrowingAxe: DisassemblySourceGroup = {
	name: 'ThrowingAxe',
	items: [
		{ item: i('Toktz-xil-ul'), lvl: 60, partQuantity: 8 },
		{ item: i("Morrigan's throwing axe"), lvl: 78, partQuantity: 8 }
	],
	parts: { simple: 35, blade: 30, plated: 30, sharp: 3, swift: 2 }
};

export default ThrowingAxe;
