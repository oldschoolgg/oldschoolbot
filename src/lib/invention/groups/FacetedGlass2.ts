import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const FacetedGlass2: DisassemblySourceGroup = {
	name: 'FacetedGlass2',
	items: [
		{ item: i('Empty light orb'), lvl: 87 },
		{ item: i('Light orb'), lvl: 87 }
	],
	parts: {},
	partQuantity: 2
};

export default FacetedGlass2;
