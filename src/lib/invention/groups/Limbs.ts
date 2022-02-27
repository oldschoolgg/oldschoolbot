import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Limbs: DisassemblySourceGroup = {
	name: 'Limbs',
	items: [
		{ item: i('Bronze limbs'), lvl: 1 },
		{ item: i('Iron limbs'), lvl: 10 },
		{ item: i('Blurite limbs'), lvl: 12 },
		{ item: i('Mithril limbs'), lvl: 30 }
	],
	parts: {},
	partQuantity: 2
};

export default Limbs;
