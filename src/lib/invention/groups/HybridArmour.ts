import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const HybridArmour: DisassemblySourceGroup = {
	name: 'HybridArmour',
	items: [
		{
			item: i('Void knight top'),
			lvl: 42,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'pestiferous', chance: 100, amount: 2 }] }
		},
		{ item: i('Obsidian platebody'), lvl: 60, partQuantity: 8 },
		{
			item: i('Crystal body'),
			lvl: 70,
			partQuantity: 8,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 8 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		},
		{ item: i('Dragonstone boots'), lvl: 50, partQuantity: 4 },
		{ item: i('Cape of legends'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-1 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-10 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-11 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-12 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-13 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-14 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-15 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-16 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-17 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-18 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-19 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-2 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-20 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-21 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-22 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-23 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-24 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-25 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-26 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-27 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-28 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-29 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-3 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-30 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-31 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-32 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-33 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-34 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-35 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-36 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-37 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-38 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-39 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-4 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-40 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-41 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-42 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-43 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-44 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-45 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-46 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-47 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-48 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-49 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-5 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-50 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-6 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-7 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-8 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Team-9 cape'), lvl: 1, partQuantity: 6 },
		{ item: i('Obsidian cape'), lvl: 35, partQuantity: 6 },
		{ item: i("Klank's gauntlets"), lvl: 1, partQuantity: 4 },
		{ item: i('Insulated boots'), lvl: 37, partQuantity: 4 },
		{
			item: i('Void knight gloves'),
			lvl: 42,
			partQuantity: 4,
			special: { always: true, parts: [{ type: 'pestiferous', chance: 100, amount: 4 }] }
		},
		{ item: i('Dragonstone gauntlets'), lvl: 50, partQuantity: 4 },
		{ item: i('Slayer helmet'), lvl: 20, partQuantity: 6 },
		{
			item: i('Void knight robe'),
			lvl: 42,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'pestiferous', chance: 100, amount: 2 }] }
		},
		{ item: i('Berserker ring'), lvl: 45, partQuantity: 6 },
		{
			item: i('Crystal helm'),
			lvl: 70,
			partQuantity: 6,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 6 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		},
		{ item: i('Obsidian platelegs'), lvl: 60, partQuantity: 8 },
		{
			item: i('Crystal legs'),
			lvl: 70,
			partQuantity: 8,
			special: {
				always: true,
				parts: [
					{ type: 'crystal', chance: 74, amount: 8 },
					{ type: 'seren', chance: 13, amount: 1 },
					{ type: 'faceted', chance: 13, amount: 1 }
				]
			}
		},
		{ item: i('Mirror shield'), lvl: 25, partQuantity: 8 }
	],
	parts: { cover: 45, deflecting: 45, powerful: 3, evasive: 3, protective: 3 }
};

export default HybridArmour;
