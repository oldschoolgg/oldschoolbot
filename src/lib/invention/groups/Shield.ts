import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Shield: DisassemblySourceGroup = {
	name: 'Shield',
	items: [
		{ item: i('Granite shield'), lvl: 55, partQuantity: 8 },
		{ item: i('Dragon kiteshield'), lvl: 60, partQuantity: 8 }
	],
	parts: { cover: 35, base: 30, deflecting: 30, strong: 3, protective: 2 }
};

export default Shield;
