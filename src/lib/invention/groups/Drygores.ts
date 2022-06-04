import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Drygores: DisassemblySourceGroup = {
	name: 'Drygores',
	items: [
		{ item: i('Drygore rapier'), lvl: 120 },
		{ item: i('Offhand drygore rapier'), lvl: 120 },

		{ item: i('Drygore longsword'), lvl: 120 },
		{ item: i('Offhand drygore longsword'), lvl: 120 },

		{ item: i('Drygore mace'), lvl: 120 },
		{ item: i('Offhand drygore mace'), lvl: 120 }
	],
	parts: { drygore: 100 }
};
