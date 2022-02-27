import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const MeleeLegsBase: DisassemblySourceGroup = {
	name: 'MeleeLegsBase',
	items: [{ item: i("Iron plateskirt"), lvl: 10 },{ item: i("Steel platelegs"), lvl: 20 },{ item: i("Steel plateskirt"), lvl: 20 },{ item: i("Mithril platelegs"), lvl: 30 },{ item: i("Mithril plateskirt"), lvl: 30 },{ item: i("Rune plateskirt"), lvl: 50 },],
	parts: {},
  partQuantity: 12
};

export default MeleeLegsBase;
