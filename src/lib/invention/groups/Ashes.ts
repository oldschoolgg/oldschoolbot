import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Ashes: DisassemblySourceGroup = {
	name: 'Ashes',
	items: [
		{ item: i('Fiendish ashes'), lvl: 10 },
		{ item: i('Vile ashes'), lvl: 20 },
		{ item: i('Malicious ashes'), lvl: 50 },
		{ item: i('Abyssal ashes'), lvl: 60 },
		{ item: i('Infernal ashes'), lvl: 90 },
		{ item: i('Nightmarish ashes'), lvl: 95 }
	],
	parts: { pious: 70, organic: 30 }
};
