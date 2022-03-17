import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Shield: DisassemblySourceGroup = {
	name: 'Shield',
	items: [
		{ item: i('Granite shield'), lvl: 55, partQuantity: 8 },
		{ item: i('Dragon kiteshield'), lvl: 60, partQuantity: 8 }
	],
	parts: { cover: 0, base: 0, deflecting: 0, strong: 0, protective: 0 }
};

export default Shield;
