import getOSItem from '../../util/getOSItem';
import { DisassemblySourceGroup } from '..';

const i = getOSItem;

export const RangedArmour: DisassemblySourceGroup = {
	name: 'RangedArmour',
	items: [
		{ item: i("Ava's attractor"), lvl: 1 },
		{ item: i('Leather body'), lvl: 1 },
		{ item: i('Leather chaps'), lvl: 1 },
		{ item: i('Hardleather body'), lvl: 10 },
		{ item: i('Studded body'), lvl: 20 },
		{
			item: i('Studded body (g)'),
			lvl: 20
		},
		{
			item: i('Studded body (t)'),
			lvl: 20
		},
		{ item: i('Studded chaps'), lvl: 20 },
		{ item: i('Frog-leather body'), lvl: 25 },
		{ item: i('Frog-leather chaps'), lvl: 25 },
		{ item: i('Snakeskin body'), lvl: 30 },
		{ item: i('Snakeskin chaps'), lvl: 30 },
		{
			item: i('Armadyl robe top'),
			lvl: 40
		},
		{ item: i('Spined body'), lvl: 50 },
		{
			item: ["Green d'hide vambraces"].map(i),
			lvl: 57
		},
		{ item: i('Green dragon leather'), lvl: 57 },
		{ item: ["Green d'hide chaps", "Green d'hide chaps (g)", "Green d'hide chaps (t)"].map(i), lvl: 60 },
		{ item: ["Green d'hide shield"].map(i), lvl: 62 },
		{ item: ["Green d'hide body", "Green d'hide body (g)", "Green d'hide body (t)"].map(i), lvl: 63 },

		{ item: i('Blue dragon leather'), lvl: 66 },
		{ item: ["Blue d'hide vambraces"].map(i), lvl: 66 },
		{ item: ["Blue d'hide chaps", "Blue d'hide chaps (g)", "Blue d'hide chaps (t)"].map(i), lvl: 68 },
		{ item: ["Blue d'hide shield"].map(i), lvl: 69 },
		{ item: ["Blue d'hide body", "Blue d'hide body (g)", "Blue d'hide body (t)"].map(i), lvl: 71 },

		{ item: i('Red dragon leather'), lvl: 73 },
		{ item: ["Red d'hide vambraces"].map(i), lvl: 73 },
		{ item: ["Red d'hide chaps", "Red d'hide chaps (g)", "Red d'hide chaps (t)"].map(i), lvl: 75 },
		{ item: ["Red d'hide shield"].map(i), lvl: 76 },
		{ item: ["Red d'hide body", "Red d'hide body (g)", "Red d'hide body (t)"].map(i), lvl: 77 },

		{ item: i('Black dragon leather'), lvl: 79 },
		{
			item: ["Black d'hide vambraces"].map(i),
			lvl: 79
		},
		{ item: ["Black d'hide chaps", "Black d'hide chaps (g)", "Black d'hide chaps (t)"].map(i), lvl: 82 },
		{ item: ["Black d'hide shield"].map(i), lvl: 83 },
		{ item: ["Black d'hide body", "Black d'hide body (g)", "Black d'hide body (t)"].map(i), lvl: 84 },

		{ item: i("Morrigan's leather body"), lvl: 78 },
		{
			item: i('Ranger boots'),
			lvl: 40
		},
		{ item: i('Spined boots'), lvl: 50 },
		{ item: i("Ava's accumulator"), lvl: 1 },
		{
			item: i('Armadyl cloak'),
			lvl: 40
		},
		{ item: i('Leather boots'), lvl: 1 },
		{ item: i('Leather gloves'), lvl: 1 },
		{ item: i('Leather vambraces'), lvl: 1 },
		{ item: i('Spiky vambraces'), lvl: 5 },
		{ item: i('Hardleather gloves'), lvl: 10 },
		{ item: i('Frog-leather boots'), lvl: 25 },
		{ item: i('Snakeskin boots'), lvl: 30 },
		{ item: i('Snakeskin vambraces'), lvl: 30 },
		{ item: i('Green spiky vambraces'), lvl: 40 },
		{ item: i('Blue spiky vambraces'), lvl: 50 },
		{ item: i('Spined gloves'), lvl: 50 },
		{ item: i('Red spiky vambraces'), lvl: 55 },
		{ item: i('Black spiky vambraces'), lvl: 60 },
		{ item: i('Leather cowl'), lvl: 1 },
		{ item: i('Snakeskin bandana'), lvl: 30 },
		{
			item: i('Armadyl mitre'),
			lvl: 40
		},
		{
			item: i('Guthix mitre'),
			lvl: 40
		},
		{
			item: i('Robin hood hat'),
			lvl: 40
		},
		{
			item: i('Saradomin mitre'),
			lvl: 40
		},
		{
			item: i('Zamorak mitre'),
			lvl: 40
		},
		{ item: i('Archer helm'), lvl: 45 },
		{ item: i('Ranger hat'), lvl: 50 },
		{ item: i('Runner hat'), lvl: 50 },
		{ item: i('Spined helm'), lvl: 50 },
		{
			item: i('Armadyl chestplate'),
			lvl: 70,

			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 8 }] }
		},
		{
			item: ['3rd age range coif', '3rd age range top', '3rd age range legs', '3rd age vambraces'].map(i),
			lvl: 65,
			flags: ['third_age']
		},
		{
			item: i('Armadyl helmet'),
			lvl: 70,

			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 6 }] }
		},
		{
			item: i("Karil's coif"),
			lvl: 70
		},
		{ item: i("Morrigan's coif"), lvl: 78 },
		{
			item: i('Studded chaps (g)'),
			lvl: 20
		},
		{
			item: i('Studded chaps (t)'),
			lvl: 20
		},
		{
			item: i('Armadyl robe legs'),
			lvl: 40
		},
		{ item: i('Penance skirt'), lvl: 50 },
		{ item: i('Spined chaps'), lvl: 50 },
		{
			item: i('Armadyl chainskirt'),
			lvl: 70,

			special: { always: true, parts: [{ type: 'armadyl', chance: 100, amount: 8 }] }
		},
		{ item: i("Morrigan's leather chaps"), lvl: 78 },
		{ item: i('Hard leather shield'), lvl: 10 },
		{
			item: i('Elysian spirit shield'),
			lvl: 75,

			special: { always: true, parts: [{ type: 'corporeal', chance: 100, amount: 4 }] }
		}
	],
	parts: { protective: 2 }
};
