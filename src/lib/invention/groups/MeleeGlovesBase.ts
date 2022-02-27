import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MeleeGlovesBase: DisassemblySourceGroup = {
	name: 'MeleeGlovesBase',
	items: [{ item: i('Steel gauntlets'), lvl: 20 }],
	parts: {},
	partQuantity: 4
};

export default MeleeGlovesBase;
