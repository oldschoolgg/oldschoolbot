import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Javelin: DisassemblySourceGroup = {
	name: 'Javelin',
	items: [{ item: i("Morrigan's javelin"), lvl: 78, partQuantity: 8 }],
	parts: { simple: 0, blade: 0, spiked: 0, sharp: 0, swift: 0 }
};

export default Javelin;
