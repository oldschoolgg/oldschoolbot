import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MagicGloves: DisassemblySourceGroup = {
	name: 'MagicGloves',
	items: [{ item: i("Skeletal gloves"), lvl: 50 },{ item: i("Infinity gloves"), lvl: 55 },{ item: i("Lunar gloves"), lvl: 60 },],
	parts: {},
  partQuantity: 4
};

export default MagicGloves;
