import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Leather: DisassemblySourceGroup = {
	name: 'Leather',
	items: [{ item: i("Leather"), lvl: 1 },{ item: i("Hard leather"), lvl: 25 },{ item: i("Green dragon leather"), lvl: 57 },{ item: i("Blue dragon leather"), lvl: 66 },],
	parts: {},
  partQuantity: 1
};

export default Leather;
