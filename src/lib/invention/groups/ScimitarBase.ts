import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const ScimitarBase: DisassemblySourceGroup = {
	name: 'ScimitarBase',
	items: [{ item: i("Bronze scimitar"), lvl: 1 },{ item: i("Iron scimitar"), lvl: 10 },{ item: i("Steel scimitar"), lvl: 20 },{ item: i("Mithril scimitar"), lvl: 30 },{ item: i("Rune scimitar"), lvl: 50 },],
	parts: {},
  partQuantity: 8
};

export default ScimitarBase;
