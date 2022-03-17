import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const RangedArmour: DisassemblySourceGroup = {
	name: 'RangedArmour',
	items: [
		{ item: i("Ava's attractor"), lvl: 1, partQuantity: 6 },
		{
			item: i('Greater demon mask'),
			lvl: 29,
			partQuantity: 6,
			special: {
				always: true,
				parts: [
					{ type: 'historic', chance: 80, amount: 20 },
					{ type: 'classic', chance: 18, amount: 5 },
					{ type: 'timeworn', chance: 1, amount: 1 },
					{ type: 'vintage', chance: 1, amount: 1 }
				]
			}
		},
		{
			item: i('Imp mask'),
			lvl: 29,
			partQuantity: 6,
			special: {
				always: true,
				parts: [
					{ type: 'historic', chance: 80, amount: 20 },
					{ type: 'classic', chance: 18, amount: 5 },
					{ type: 'timeworn', chance: 1, amount: 1 },
					{ type: 'vintage', chance: 1, amount: 1 }
				]
			}
		},
		{
			item: i('Lesser demon mask'),
			lvl: 29,
			partQuantity: 6,
			special: {
				always: true,
				parts: [
					{ type: 'historic', chance: 80, amount: 20 },
					{ type: 'classic', chance: 18, amount: 5 },
					{ type: 'timeworn', chance: 1, amount: 1 },
					{ type: 'vintage', chance: 1, amount: 1 }
				]
			}
		},
		{ item: i('Runner boots'), lvl: 50, partQuantity: 4 },
		{ item: i('Leather body'), lvl: 1, partQuantity: 8 },
		{ item: i('Leather chaps'), lvl: 1, partQuantity: 8 },
		{ item: i('Hardleather body'), lvl: 10, partQuantity: 8 },
		{ item: i('Studded body'), lvl: 20, partQuantity: 8 },
		{
			item: i('Studded body (g)'),
			lvl: 20,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Studded body (t)'),
			lvl: 20,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Studded chaps'), lvl: 20, partQuantity: 8 },
		{ item: i('Frog-leather body'), lvl: 25, partQuantity: 8 },
		{ item: i('Frog-leather chaps'), lvl: 25, partQuantity: 8 },
		{ item: i('Snakeskin body'), lvl: 30, partQuantity: 8 },
		{ item: i('Snakeskin chaps'), lvl: 30, partQuantity: 8 },
		{
			item: i('Armadyl robe top'),
			lvl: 40,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Spined body'), lvl: 50, partQuantity: 8 },
		{
			item: i('Armadyl chestplate'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 8 }] }
		},
		{ item: i("Morrigan's leather body"), lvl: 78, partQuantity: 8 },
		{
			item: i('Ranger boots'),
			lvl: 40,
			partQuantity: 4,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 4 }] }
		},
		{ item: i('Spined boots'), lvl: 50, partQuantity: 4 },
		{ item: i("Ava's accumulator"), lvl: 1, partQuantity: 6 },
		{
			item: i('Armadyl cloak'),
			lvl: 40,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Leather boots'), lvl: 1, partQuantity: 4 },
		{ item: i('Leather gloves'), lvl: 1, partQuantity: 4 },
		{ item: i('Leather vambraces'), lvl: 1, partQuantity: 4 },
		{ item: i('Spiky vambraces'), lvl: 5, partQuantity: 4 },
		{ item: i('Hardleather gloves'), lvl: 10, partQuantity: 4 },
		{ item: i('Frog-leather boots'), lvl: 25, partQuantity: 4 },
		{ item: i('Snakeskin boots'), lvl: 30, partQuantity: 4 },
		{ item: i('Snakeskin vambraces'), lvl: 30, partQuantity: 4 },
		{ item: i('Green spiky vambraces'), lvl: 40, partQuantity: 4 },
		{ item: i('Blue spiky vambraces'), lvl: 50, partQuantity: 4 },
		{ item: i('Spined gloves'), lvl: 50, partQuantity: 4 },
		{ item: i('Red spiky vambraces'), lvl: 55, partQuantity: 4 },
		{ item: i('Black spiky vambraces'), lvl: 60, partQuantity: 4 },
		{ item: i('Leather cowl'), lvl: 1, partQuantity: 6 },
		{ item: i('Snakeskin bandana'), lvl: 30, partQuantity: 6 },
		{
			item: i('Armadyl mitre'),
			lvl: 40,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Guthix mitre'),
			lvl: 40,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Robin hood hat'),
			lvl: 40,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Saradomin mitre'),
			lvl: 40,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{
			item: i('Zamorak mitre'),
			lvl: 40,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 6 }] }
		},
		{ item: i('Archer helm'), lvl: 45, partQuantity: 6 },
		{ item: i('Ranger hat'), lvl: 50, partQuantity: 6 },
		{ item: i('Runner hat'), lvl: 50, partQuantity: 6 },
		{ item: i('Spined helm'), lvl: 50, partQuantity: 6 },
		{
			item: i('Armadyl helmet'),
			lvl: 70,
			partQuantity: 6,
			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 6 }] }
		},
		{
			item: i("Karil's coif"),
			lvl: 70,
			partQuantity: 6,
			special: { always: false, parts: [{ type: 'undead', chance: 100, amount: 6 }] }
		},
		{ item: i("Morrigan's coif"), lvl: 78, partQuantity: 6 },
		{
			item: i('Studded chaps (g)'),
			lvl: 20,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Studded chaps (t)'),
			lvl: 20,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{
			item: i('Armadyl robe legs'),
			lvl: 40,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'fortunate', chance: 100, amount: 8 }] }
		},
		{ item: i('Penance skirt'), lvl: 50, partQuantity: 8 },
		{ item: i('Spined chaps'), lvl: 50, partQuantity: 8 },
		{
			item: i('Armadyl chainskirt'),
			lvl: 70,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 8 }] }
		},
		{ item: i("Morrigan's leather chaps"), lvl: 78, partQuantity: 8 },
		{ item: i('Hard leather shield'), lvl: 10, partQuantity: 8 },
		{
			item: i('Elysian spirit shield'),
			lvl: 75,
			partQuantity: 8,
			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 4 }] }
		}
	],
	parts: { cover: 35, tensile: 30, padded: 30, evasive: 3, protective: 2 }
};

export default RangedArmour;
