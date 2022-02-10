import { resolveNameBank } from 'oldschooljs/dist/util';

import { Createable } from '../createables';

export const lmsCreatables: Createable[] = [
	// Granite mauls
	{
		name: 'Granite maul (or)',
		inputItems: resolveNameBank({
			'Granite maul': 1,
			'Granite clamp': 1
		}),
		outputItems: resolveNameBank({ 'Granite maul (or)': 1 })
	},
	{
		name: 'Granite maul (ornate handle)',
		inputItems: resolveNameBank({
			'Granite maul': 1,
			'Ornate maul handle': 1
		}),
		outputItems: resolveNameBank({ 'Granite maul (ornate handle)': 1 })
	},
	{
		name: 'Granite maul (or) (ornate handle)',
		inputItems: resolveNameBank({
			'Granite maul (ornate handle)': 1,
			'Granite clamp': 1
		}),
		outputItems: resolveNameBank({ 'Granite maul (or) (ornate handle)': 1 })
	},
	/**
	 *
	 * Upgrade kits
	 *
	 */
	{
		name: 'Mystic steam staff (or)',
		inputItems: resolveNameBank({
			'Mystic steam staff': 1,
			'Steam staff upgrade kit': 1
		}),
		outputItems: resolveNameBank({ 'Mystic steam staff (or)': 1 })
	},
	{
		name: 'Revert mystic steam staff (or)',
		inputItems: resolveNameBank({
			'Mystic steam staff (or)': 1
		}),
		outputItems: resolveNameBank({ 'Mystic steam staff': 1 }),
		noCl: true
	},
	//
	{
		name: 'Steam battlestaff (or)',
		inputItems: resolveNameBank({
			'Steam battlestaff': 1,
			'Steam staff upgrade kit': 1
		}),
		outputItems: resolveNameBank({ 'Steam battlestaff (or)': 1 })
	},
	{
		name: 'Revert steam battlestaff (or)',
		inputItems: resolveNameBank({
			'Steam battlestaff (or)': 1
		}),
		outputItems: resolveNameBank({ 'Steam battlestaff': 1 }),
		noCl: true
	},
	//
	{
		name: 'Mystic lava staff (or)',
		inputItems: resolveNameBank({
			'Mystic lava staff': 1,
			'Lava staff upgrade kit': 1
		}),
		outputItems: resolveNameBank({ 'Mystic lava staff (or)': 1 })
	},
	{
		name: 'Revert mystic lava staff (or)',
		inputItems: resolveNameBank({
			'Mystic lava staff (or)': 1
		}),
		outputItems: resolveNameBank({ 'Mystic lava staff': 1 }),
		noCl: true
	},
	//
	{
		name: 'Lava battlestaff (or)',
		inputItems: resolveNameBank({
			'Lava battlestaff': 1,
			'Lava staff upgrade kit': 1
		}),
		outputItems: resolveNameBank({ 'Lava battlestaff (or)': 1 })
	},
	{
		name: 'Revert lava battlestaff (or)',
		inputItems: resolveNameBank({
			'Lava battlestaff (or)': 1
		}),
		outputItems: resolveNameBank({ 'Lava battlestaff': 1 }),
		noCl: true
	},
	//
	{
		name: 'Dragon pickaxe (upgraded)',
		inputItems: resolveNameBank({
			'Dragon pickaxe': 1,
			'Dragon pickaxe upgrade kit': 1
		}),
		outputItems: resolveNameBank({ 'Dragon pickaxe (upgraded)': 1 })
	},
	{
		name: 'Revert dragon pickaxe (upgraded)',
		inputItems: resolveNameBank({
			'Dragon pickaxe (upgraded)': 1
		}),
		outputItems: resolveNameBank({ 'Dragon pickaxe': 1 }),
		noCl: true
	},
	//
	{
		name: 'Malediction ward (or)',
		inputItems: resolveNameBank({
			'Malediction ward': 1,
			'Ward upgrade kit': 1
		}),
		outputItems: resolveNameBank({ 'Malediction ward (or)': 1 })
	},
	{
		name: 'Revert malediction ward (or)',
		inputItems: resolveNameBank({
			'Malediction ward (or)': 1
		}),
		outputItems: resolveNameBank({ 'Malediction ward': 1 }),
		noCl: true
	},
	//
	{
		name: 'Odium ward (or)',
		inputItems: resolveNameBank({
			'Odium ward': 1,
			'Ward upgrade kit': 1
		}),
		outputItems: resolveNameBank({ 'Odium ward (or)': 1 })
	},
	{
		name: 'Revert odium ward (or)',
		inputItems: resolveNameBank({
			'Odium ward (or)': 1
		}),
		outputItems: resolveNameBank({ 'Odium ward': 1 }),
		noCl: true
	},
	/**
	 *
	 * Paints
	 *
	 */
	{
		name: 'Dark bow (green)',
		inputItems: resolveNameBank({
			'Dark bow': 1,
			'Green dark bow paint': 1
		}),
		outputItems: resolveNameBank({ 'Dark bow (green)': 1 })
	},
	{
		name: 'Revert dark bow (green)',
		inputItems: resolveNameBank({
			'Dark bow (green)': 1
		}),
		outputItems: resolveNameBank({ 'Dark bow': 1 }),
		noCl: true
	},
	//
	{
		name: 'Dark bow (blue)',
		inputItems: resolveNameBank({
			'Dark bow': 1,
			'Blue dark bow paint': 1
		}),
		outputItems: resolveNameBank({ 'Dark bow (blue)': 1 })
	},
	{
		name: 'Revert dark bow (blue)',
		inputItems: resolveNameBank({
			'Dark bow (blue)': 1
		}),
		outputItems: resolveNameBank({ 'Dark bow': 1 }),
		noCl: true
	},
	//
	{
		name: 'Dark bow (yellow)',
		inputItems: resolveNameBank({
			'Dark bow': 1,
			'Yellow dark bow paint': 1
		}),
		outputItems: resolveNameBank({ 'Dark bow (yellow)': 1 })
	},
	{
		name: 'Revert dark bow (yellow)',
		inputItems: resolveNameBank({
			'Dark bow (yellow)': 1
		}),
		outputItems: resolveNameBank({ 'Dark bow': 1 }),
		noCl: true
	},
	//
	{
		name: 'Dark bow (white)',
		inputItems: resolveNameBank({
			'Dark bow': 1,
			'White dark bow paint': 1
		}),
		outputItems: resolveNameBank({ 'Dark bow (white)': 1 })
	},
	{
		name: 'Revert dark bow (white)',
		inputItems: resolveNameBank({
			'Dark bow (white)': 1
		}),
		outputItems: resolveNameBank({ 'Dark bow': 1 }),
		noCl: true
	},
	/**
	 *
	 * Mixes
	 *
	 */
	{
		name: 'Volcanic abyssal whip',
		inputItems: resolveNameBank({
			'Abyssal whip': 1,
			'Volcanic whip mix': 1
		}),
		outputItems: resolveNameBank({ 'Volcanic abyssal whip': 1 })
	},
	{
		name: 'Revert volcanic abyssal whip',
		inputItems: resolveNameBank({
			'Volcanic abyssal whip': 1
		}),
		outputItems: resolveNameBank({ 'Abyssal whip': 1 }),
		noCl: true
	},
	//
	{
		name: 'Frozen abyssal whip',
		inputItems: resolveNameBank({
			'Abyssal whip': 1,
			'Frozen whip mix': 1
		}),
		outputItems: resolveNameBank({ 'Frozen abyssal whip': 1 })
	},
	{
		name: 'Revert frozen abyssal whip',
		inputItems: resolveNameBank({
			'Frozen abyssal whip': 1
		}),
		outputItems: resolveNameBank({ 'Abyssal whip': 1 }),
		noCl: true
	},
	/**
	 *
	 * Other
	 *
	 */
	{
		name: 'Staff of balance',
		inputItems: resolveNameBank({
			'Staff of the dead': 1,
			'Guthixian icon': 1
		}),
		outputItems: resolveNameBank({ 'Staff of balance': 1 })
	},
	{
		name: "Saradomin's blessed sword",
		inputItems: resolveNameBank({
			'Saradomin sword': 1,
			"Saradomin's tear": 1
		}),
		outputItems: resolveNameBank({ "Saradomin's blessed sword": 1 })
	},
	{
		name: 'Magic shortbow (i)',
		inputItems: resolveNameBank({
			'Magic shortbow': 1,
			'Magic shortbow scroll': 1
		}),
		outputItems: resolveNameBank({ 'Magic shortbow (i)': 1 })
	},
	{
		name: 'Looting bag',
		inputItems: resolveNameBank({
			'Looting bag note': 1
		}),
		outputItems: resolveNameBank({ 'Looting bag': 1 })
	},
	{
		name: 'Rune pouch',
		inputItems: resolveNameBank({
			'Rune pouch note': 1
		}),
		outputItems: resolveNameBank({ 'Rune pouch': 1 })
	}
];
console.log(lmsCreatables.map(i => i.name).join(', '));
