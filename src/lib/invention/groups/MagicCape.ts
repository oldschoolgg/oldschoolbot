import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MagicCape: DisassemblySourceGroup = {
	name: 'MagicCape',
	items: [{ item: i("Lunar cape"), lvl: 60 },],
	parts: {},
  partQuantity: 6
};

export default MagicCape;
