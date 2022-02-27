import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MeleeGloves: DisassemblySourceGroup = {
	name: 'MeleeGloves',
	items: [{ item: i("Penance gloves"), lvl: 40 },{ item: i("Rock-shell gloves"), lvl: 50 },],
	parts: {},
  partQuantity: 4
};

export default MeleeGloves;
