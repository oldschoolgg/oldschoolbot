import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const MeleeCape: DisassemblySourceGroup = {
	name: 'MeleeCape',
	items: [
		{
			item: i('Bandos cloak'),
			lvl: 40,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		}
	],
	parts: {},
	partQuantity: 6
};

export default MeleeCape;
