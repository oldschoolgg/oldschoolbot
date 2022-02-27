import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Potion: DisassemblySourceGroup = {
	name: 'Potion',
	items: [{ item: i('Magic essence (unf)'), lvl: 57 }],
	parts: {},
	partQuantity: 1
};

export default Potion;
