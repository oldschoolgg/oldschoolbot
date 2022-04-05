import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const FacetedGlass: DisassemblySourceGroup = {
	name: 'FacetedGlass',
	items: [
		{ item: i('Empty light orb'), lvl: 87, partQuantity: 2 },
		{ item: i('Light orb'), lvl: 87, partQuantity: 2 }
	],
	parts: { clear: 30, delicate: 30, smooth: 30, faceted: 1, enhancing: 3 }
};

export default FacetedGlass;
