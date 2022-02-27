import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Herbs: DisassemblySourceGroup = {
	name: 'Herbs',
	items: [{ item: i("Nasturtiums"), lvl: 25 },],
	parts: {},
  partQuantity: 1
};

export default Herbs;
