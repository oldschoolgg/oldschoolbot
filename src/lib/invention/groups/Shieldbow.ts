import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Shieldbow: DisassemblySourceGroup = {
	name: 'Shieldbow',
	items: [{ item: i("Training bow"), lvl: 1 },{ item: i("Ogre bow"), lvl: 30 },{ item: i("Dark bow"), lvl: 70 },],
	parts: {},
  partQuantity: 12
};

export default Shieldbow;
