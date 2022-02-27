import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const UnstrungJewellery: DisassemblySourceGroup = {
	name: 'UnstrungJewellery',
	items: [{ item: i("Unstrung symbol"), lvl: 16 },{ item: i("Unstrung emblem"), lvl: 17 },],
	parts: {},
  partQuantity: 2
};

export default UnstrungJewellery;
