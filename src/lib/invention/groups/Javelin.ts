import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Javelin: DisassemblySourceGroup = {
	name: 'Javelin',
	items: [{ item: i("Morrigan's javelin"), lvl: 78, partQuantity: 8 }],
	parts: { simple: 35, blade: 30, spiked: 30, sharp: 3, swift: 2 }
};

export default Javelin;
