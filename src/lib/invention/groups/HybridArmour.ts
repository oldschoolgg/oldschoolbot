import type { DisassemblySourceGroup } from '..';
import getOSItem from '../../util/getOSItem';

const i = getOSItem;

export const HybridArmour: DisassemblySourceGroup = {
	name: 'HybridArmour',
	items: [
		{ item: i('Cape of legends'), lvl: 1 },
		{
			item: i('Void knight top'),
			lvl: 42
		},
		{ item: i('Obsidian platebody'), lvl: 60 },
		{
			item: i('Crystal body'),
			lvl: 70
		},
		{ item: i('Dragonstone boots'), lvl: 50 },
		{ item: i('Obsidian cape'), lvl: 35 },
		{
			item: i('Void knight gloves'),
			lvl: 42
		},
		{ item: i('Dragonstone gauntlets'), lvl: 50 },
		{ item: i('Slayer helmet'), lvl: 20 },
		{
			item: i('Void knight robe'),
			lvl: 42
		},
		{ item: i('Berserker ring'), lvl: 45 },
		{
			item: i('Crystal helm'),
			lvl: 70
		},
		{ item: i('Obsidian platelegs'), lvl: 60 },
		{
			item: i('Crystal legs'),
			lvl: 70
		}
	],
	parts: { powerful: 3, protective: 3 }
};
