import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const UnstrungJewellery: DisassemblySourceGroup = {
	name: 'UnstrungJewellery',
	items: [
		{ item: i('Unstrung symbol'), lvl: 16, partQuantity: 2 },
		{ item: i('Unstrung emblem'), lvl: 17, partQuantity: 2 }
	],
	parts: { delicate: 0, connector: 0, smooth: 0, precious: 0, enhancing: 0 }
};

export default UnstrungJewellery;
