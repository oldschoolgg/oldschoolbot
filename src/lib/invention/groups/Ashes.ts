import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Ashes: DisassemblySourceGroup = {
	name: 'Ashes',
	items: [
		{ item: i('Fiendish ashes'), lvl: 10 },
		{ item: i('Vile ashes'), lvl: 20 },
		{ item: i('Malicious ashes'), lvl: 50 },
		{ item: i('Abyssal ashes'), lvl: 60 },
		{ item: i('Infernal ashes'), lvl: 90 }
	],
	parts: { pious: 70, organic: 30 }
};
