import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Shield: DisassemblySourceGroup = {
	name: 'Shield',
	items: [{ item: i("Granite shield"), lvl: 55 },{ item: i("Dragon kiteshield"), lvl: 60 },],
	parts: {},
  partQuantity: 8
};

export default Shield;
