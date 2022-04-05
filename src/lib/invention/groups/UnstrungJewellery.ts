import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const UnstrungJewellery: DisassemblySourceGroup = {
	name: 'UnstrungJewellery',
	items: [
		{ item: i('Unstrung symbol'), lvl: 16, partQuantity: 2 },
		{ item: i('Unstrung emblem'), lvl: 17, partQuantity: 2 }
	],
	parts: { delicate: 35, connector: 30, smooth: 30, precious: 3, enhancing: 2 }
};

export default UnstrungJewellery;
