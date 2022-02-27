import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Dose1: DisassemblySourceGroup = {
	name: 'Dose1',
	items: [{ item: i("Vial of water"), lvl: 1 },],
	parts: {},
  partQuantity: 1
};

export default Dose1;
