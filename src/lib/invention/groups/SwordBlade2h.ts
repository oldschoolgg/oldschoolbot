import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const SwordBlade2h: DisassemblySourceGroup = {
	name: 'SwordBlade2h',
	items: [{ item: i('Godsword blade'), lvl: 75 }],
	parts: {},
	partQuantity: 6
};

export default SwordBlade2h;
