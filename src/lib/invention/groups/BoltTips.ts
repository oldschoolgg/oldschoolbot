import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const BoltTips: DisassemblySourceGroup = {
	name: 'BoltTips',
	items: [{ item: i("Bronze bolts (unf)"), lvl: 1 },{ item: i("Silver bolts (unf)"), lvl: 1 },{ item: i("Blurite bolts (unf)"), lvl: 2 },{ item: i("Opal bolt tips"), lvl: 2 },{ item: i("Iron bolts (unf)"), lvl: 4 },{ item: i("Jade bolt tips"), lvl: 6 },{ item: i("Topaz bolt tips"), lvl: 12 },{ item: i("Unfinished broad bolts"), lvl: 12 },{ item: i("Mithril bolts (unf)"), lvl: 13 },{ item: i("Emerald bolt tips"), lvl: 14 },{ item: i("Sapphire bolt tips"), lvl: 14 },{ item: i("Ruby bolt tips"), lvl: 15 },{ item: i("Onyx bolt tips"), lvl: 18 },{ item: i("Barb bolttips"), lvl: 22 },],
	parts: {},
  partQuantity: 2
};

export default BoltTips;
