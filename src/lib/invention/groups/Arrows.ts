import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Arrows: DisassemblySourceGroup = {
	name: 'Arrows',
	items: [{ item: i("Bronze arrow"), lvl: 1 },{ item: i("Training arrows"), lvl: 1 },{ item: i("Bronze brutal"), lvl: 2 },{ item: i("Iron arrow"), lvl: 5 },{ item: i("Iron brutal"), lvl: 5 },{ item: i("Steel brutal"), lvl: 7 },{ item: i("Steel arrow"), lvl: 10 },{ item: i("Mithril brutal"), lvl: 11 },{ item: i("Mithril arrow"), lvl: 15 },{ item: i("Ogre arrow"), lvl: 15 },{ item: i("Ice arrows"), lvl: 20 },{ item: i("Rune brutal"), lvl: 21 },{ item: i("Rune arrow"), lvl: 25 },{ item: i("Dragon arrow"), lvl: 30 },],
	parts: {precise: 3, head: 30, stave: 40, crafted: 27},
  partQuantity: 6
};

export default Arrows;
