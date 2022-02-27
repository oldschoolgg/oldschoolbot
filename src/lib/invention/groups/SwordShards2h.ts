import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const SwordShards2h: DisassemblySourceGroup = {
	name: 'SwordShards2h',
	items: [{ item: i("Godsword shard 1"), lvl: 75 },{ item: i("Godsword shard 2"), lvl: 75 },{ item: i("Godsword shard 3"), lvl: 75 },],
	parts: {},
  partQuantity: 2
};

export default SwordShards2h;
