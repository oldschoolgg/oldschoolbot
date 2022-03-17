import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const ThrowingAxe: DisassemblySourceGroup = {
	name: 'ThrowingAxe',
	items: [
		{ item: i('Toktz-xil-ul'), lvl: 60, partQuantity: 8 },
		{ item: i("Morrigan's throwing axe"), lvl: 78, partQuantity: 8 }
	],
	parts: { simple: 0, blade: 0, plated: 0, sharp: 0, swift: 0 }
};

export default ThrowingAxe;
