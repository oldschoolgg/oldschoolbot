import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const FacetedGlass: DisassemblySourceGroup = {
	name: 'FacetedGlass',
	items: [
		{ item: i('Empty light orb'), lvl: 87, partQuantity: 2 },
		{ item: i('Light orb'), lvl: 87, partQuantity: 2 }
	],
	parts: { clear: 0, delicate: 0, smooth: 0, faceted: 0, enhancing: 0 }
};

export default FacetedGlass;
