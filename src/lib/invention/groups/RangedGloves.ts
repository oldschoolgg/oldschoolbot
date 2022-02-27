import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const RangedGloves: DisassemblySourceGroup = {
	name: 'RangedGloves',
	items: [{ item: i("Leather boots"), lvl: 1 },{ item: i("Leather gloves"), lvl: 1 },{ item: i("Leather vambraces"), lvl: 1 },{ item: i("Spiky vambraces"), lvl: 5 },{ item: i("Hardleather gloves"), lvl: 10 },{ item: i("Frog-leather boots"), lvl: 25 },{ item: i("Snakeskin boots"), lvl: 30 },{ item: i("Snakeskin vambraces"), lvl: 30 },{ item: i("Green spiky vambraces"), lvl: 40 },{ item: i("Blue spiky vambraces"), lvl: 50 },{ item: i("Spined gloves"), lvl: 50 },{ item: i("Red spiky vambraces"), lvl: 55 },{ item: i("Black spiky vambraces"), lvl: 60 },],
	parts: {},
  partQuantity: 4
};

export default RangedGloves;
