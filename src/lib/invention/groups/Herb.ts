import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const Herb: DisassemblySourceGroup = {
	name: 'Herb',
	items: [
		{ item: i('Guam leaf'), lvl: 3 },
		{ item: i('Grimy guam leaf'), lvl: 3 },
		{ item: i('Marrentill'), lvl: 5 },
		{ item: i('Grimy marrentill'), lvl: 5 },
		{ item: i('Tarromin'), lvl: 11 },
		{ item: i('Grimy tarromin'), lvl: 11 },
		{ item: i('Harralander'), lvl: 20 },
		{ item: i('Grimy harralander'), lvl: 20 },
		{ item: i('Ranarr weed'), lvl: 25 },
		{ item: i('Grimy ranarr weed'), lvl: 25 },
		{ item: i('Toadflax'), lvl: 30 },
		{ item: i('Grimy toadflax'), lvl: 30 },
		{ item: i('Irit leaf'), lvl: 40 },
		{ item: i('Grimy irit leaf'), lvl: 40 },
		{ item: i('Avantoe'), lvl: 48 },
		{ item: i('Grimy avantoe'), lvl: 48 },
		{ item: i('Kwuarm'), lvl: 54 },
		{ item: i('Grimy kwuarm'), lvl: 54 },
		{ item: i('Snapdragon'), lvl: 59 },
		{ item: i('Grimy snapdragon'), lvl: 59 },
		{ item: i('Cadantine'), lvl: 65 },
		{ item: i('Grimy cadantine'), lvl: 65 },
		{ item: i('Lantadyme'), lvl: 67 },
		{ item: i('Grimy lantadyme'), lvl: 67 },
		{ item: i('Dwarf weed'), lvl: 70 },
		{ item: i('Grimy dwarf weed'), lvl: 70 },
		{ item: i('Torstol'), lvl: 75 },
		{ item: i('Grimy torstol'), lvl: 75 },
		{ item: i('Athelas'), lvl: 99 }
	],
	parts: { organic: 100 }
};
