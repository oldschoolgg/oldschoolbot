import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Maul: DisassemblySourceGroup = {
	name: 'Maul',
	items: [{ item: i("Barrelchest anchor"), lvl: 1 },{ item: i("Gadderhammer"), lvl: 1 },{ item: i("Golden hammer"), lvl: 1 },{ item: i("Tzhaar-ket-om"), lvl: 60 },],
	parts: {plated: 30, strong: 2, head: 30, base: 35, heavy: 3},
  partQuantity: 12
};

export default Maul;
