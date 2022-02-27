import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const HybridHelm: DisassemblySourceGroup = {
	name: 'HybridHelm',
	items: [
		{ item: i('Slayer helmet'), lvl: 20 },
		{
			item: i('Void knight robe'),
			lvl: 42,
			special: { always: true, parts: [{ type: 'pestiferous', chance: 100, amount: 2 }] }
		},
		{ item: i('Berserker ring'), lvl: 45 },
		{
			item: i('Crystal helm'),
			lvl: 70,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 6 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		}
	],
	parts: {},
	partQuantity: 6
};

export default HybridHelm;
