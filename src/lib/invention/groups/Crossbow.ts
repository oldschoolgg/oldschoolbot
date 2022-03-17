import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Crossbow: DisassemblySourceGroup = {
	name: 'Crossbow',
	items: [
		{ item: i('Bronze crossbow'), lvl: 1, partQuantity: 8 },
		{ item: i('Crossbow'), lvl: 1, partQuantity: 8 },
		{ item: i('Iron crossbow'), lvl: 10, partQuantity: 8 },
		{ item: i('Blurite crossbow (u)'), lvl: 12, partQuantity: 8 },
		{ item: i('Blurite crossbow'), lvl: 16, partQuantity: 8 },
		{ item: i('Steel crossbow'), lvl: 20, partQuantity: 8 },
		{ item: i('Mithril crossbow'), lvl: 30, partQuantity: 8 },
		{ item: i("Hunters' crossbow"), lvl: 50, partQuantity: 8 },
		{ item: i('Dragon crossbow'), lvl: 60, partQuantity: 8 },
		{ item: i('Dorgeshuun crossbow'), lvl: 28, partQuantity: 8 },
		{ item: i('Rune crossbow'), lvl: 50, partQuantity: 8 },
		{
			item: i('Armadyl crossbow'),
			lvl: 75,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 8 }] }
		}
	],
	parts: { stunning: 3, dextrous: 2, connector: 35, tensile: 30, spiked: 30 }
};

export default Crossbow;
