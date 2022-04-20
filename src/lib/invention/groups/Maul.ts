import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Maul: DisassemblySourceGroup = {
	name: 'Maul',
	items: [{ item: i('Tzhaar-ket-om'), lvl: 60 }],
	parts: { plated: 30, strong: 2, base: 35, heavy: 3 }
};
