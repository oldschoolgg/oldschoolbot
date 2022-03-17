import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const TroubleBrewingFlags: DisassemblySourceGroup = {
	name: 'TroubleBrewingFlags',
	items: [
		{ item: i('Bronze fist flag'), lvl: 1, partQuantity: 12 },
		{ item: i('Cutthroat flag'), lvl: 1, partQuantity: 12 },
		{ item: i('Lucky shot flag'), lvl: 1, partQuantity: 12 },
		{ item: i('Phasmatys flag'), lvl: 1, partQuantity: 12 },
		{ item: i('Treasure flag'), lvl: 1, partQuantity: 12 }
	],
	parts: { base: 35, blade: 30, metallic: 30, sharp: 3, dextrous: 2 }
};

export default TroubleBrewingFlags;
