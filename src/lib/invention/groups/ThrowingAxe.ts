import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const ThrowingAxe: DisassemblySourceGroup = {
	name: 'ThrowingAxe',
	items: [{ item: i("Toktz-xil-ul"), lvl: 60 },{ item: i("Morrigan's throwing axe"), lvl: 78 },],
	parts: {},
  partQuantity: 8
};

export default ThrowingAxe;
