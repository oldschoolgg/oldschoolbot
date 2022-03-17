import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Limbs: DisassemblySourceGroup = {
	name: 'Limbs',
	items: [
		{ item: i('Bronze limbs'), lvl: 1, partQuantity: 2 },
		{ item: i('Iron limbs'), lvl: 10, partQuantity: 2 },
		{ item: i('Blurite limbs'), lvl: 12, partQuantity: 2 },
		{ item: i('Mithril limbs'), lvl: 30, partQuantity: 2 }
	],
	parts: { connector: 35, tensile: 30, spiked: 30, stunning: 3, dextrous: 2 }
};

export default Limbs;
