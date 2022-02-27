import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const TroubleBrewingFlags: DisassemblySourceGroup = {
	name: 'TroubleBrewingFlags',
	items: [
		{ item: i('Bronze fist flag'), lvl: 1 },
		{ item: i('Cutthroat flag'), lvl: 1 },
		{ item: i('Lucky shot flag'), lvl: 1 },
		{ item: i('Phasmatys flag'), lvl: 1 },
		{ item: i('Treasure flag'), lvl: 1 }
	],
	parts: {},
	partQuantity: 12
};

export default TroubleBrewingFlags;
