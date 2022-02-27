import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MagicCape: DisassemblySourceGroup = {
	name: 'MagicCape',
	items: [{ item: i('Lunar cape'), lvl: 60 }],
	parts: {},
	partQuantity: 6
};

export default MagicCape;
