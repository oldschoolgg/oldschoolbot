import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const HybridGloves: DisassemblySourceGroup = {
	name: 'HybridGloves',
	items: [{ item: i("Klank's gauntlets"), lvl: 1 },{ item: i("Insulated boots"), lvl: 37 },{ item: i("Void knight gloves"), lvl: 42, special: { always: true, parts: [{ type: "pestiferous", chance: 100, amount: 4 }, ] } },{ item: i("Dragonstone gauntlets"), lvl: 50 },],
	parts: {},
  partQuantity: 4
};

export default HybridGloves;
