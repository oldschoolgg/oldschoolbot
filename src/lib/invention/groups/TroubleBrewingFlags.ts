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
	parts: { base: 0, blade: 0, metallic: 0, sharp: 0, dextrous: 0 }
};

export default TroubleBrewingFlags;
