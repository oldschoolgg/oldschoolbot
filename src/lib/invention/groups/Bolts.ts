import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Bolts: DisassemblySourceGroup = {
	name: 'Bolts',
	items: [{ item: i("Barbed bolts"), lvl: 1 },{ item: i("Bronze bolts"), lvl: 1 },{ item: i("Iron bolts"), lvl: 5 },{ item: i("Opal bolts"), lvl: 5 },{ item: i("Blurite bolts"), lvl: 8 },{ item: i("Steel bolts (unf)"), lvl: 8 },{ item: i("Black brutal"), lvl: 10, special: { always: true, parts: [{ type: "knightly", chance: 100, amount: 6 }, ] } },{ item: i("Opal bolts (e)"), lvl: 10 },{ item: i("Pearl bolts"), lvl: 10 },{ item: i("Steel bolts"), lvl: 10 },{ item: i("Jade bolts"), lvl: 12 },{ item: i("Silver bolts"), lvl: 12 },{ item: i("Bone bolts"), lvl: 14 },{ item: i("Mithril bolts"), lvl: 15 },{ item: i("Pearl bolts (e)"), lvl: 15 },{ item: i("Steel bolts (p+)"), lvl: 15 },{ item: i("Topaz bolts"), lvl: 15 },{ item: i("Jade bolts (e)"), lvl: 17 },{ item: i("Sapphire bolts"), lvl: 20 },{ item: i("Topaz bolts (e)"), lvl: 20 },{ item: i("Emerald bolts"), lvl: 25 },{ item: i("Kebbit bolts"), lvl: 25 },{ item: i("Long kebbit bolts"), lvl: 25 },{ item: i("Ruby bolts"), lvl: 25 },{ item: i("Sapphire bolts (e)"), lvl: 25 },{ item: i("Diamond bolts"), lvl: 30 },{ item: i("Dragon bolts"), lvl: 30 },{ item: i("Emerald bolts (e)"), lvl: 30 },{ item: i("Ruby bolts (e)"), lvl: 30 },{ item: i("Bolt rack"), lvl: 35 },{ item: i("Diamond bolts (e)"), lvl: 35 },{ item: i("Onyx bolts"), lvl: 35 },{ item: i("Onyx bolts (e)"), lvl: 40 },],
	parts: {stunning: 3, head: 30, base: 40, spiked: 27},
  partQuantity: 6
};

export default Bolts;
