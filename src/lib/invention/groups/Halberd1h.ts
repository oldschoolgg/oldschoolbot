import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const Halberd1h: DisassemblySourceGroup = {
	name: 'Halberd1h',
	items: [
		{ item: i('Guthix mjolnir'), lvl: 40 },
		{
			item: i('Saradomin mjolnir'),
			lvl: 40,
			special: {
				always: true,
				parts: [
					{ type: 'base', chance: 100, amount: 8 },
					{ type: 'saradomin', chance: 100, amount: 1 }
				]
			}
		},
		{
			item: i('Zamorak mjolnir'),
			lvl: 40,
			special: {
				always: true,
				parts: [
					{ type: 'base', chance: 100, amount: 8 },
					{ type: 'zamorak', chance: 100, amount: 1 }
				]
			}
		}
	],
	parts: {},
	partQuantity: 8
};

export default Halberd1h;
