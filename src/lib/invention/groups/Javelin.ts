import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Javelin: DisassemblySourceGroup = {
	name: 'Javelin',
	items: [{ item: i("Morrigan's javelin"), lvl: 78 }],
	parts: {},
	partQuantity: 8
};

export default Javelin;
