import { Bank } from 'oldschooljs';

import type { Createable } from '../createables';

export const lmsCreatables: Createable[] = [
	// Granite mauls
	{
		name: 'Granite maul (or)',
		inputItems: new Bank({
			'Granite maul': 1,
			'Granite clamp': 1
		}),
		outputItems: new Bank({ 'Granite maul (or)': 1 })
	},
	{
		name: 'Granite maul (ornate handle)',
		inputItems: new Bank({
			'Granite maul': 1,
			'Ornate maul handle': 1
		}),
		outputItems: new Bank({ 'Granite maul (ornate handle)': 1 })
	},
	{
		name: 'Granite maul (or) (ornate handle)',
		inputItems: new Bank({
			'Granite maul (ornate handle)': 1,
			'Granite clamp': 1
		}),
		outputItems: new Bank({ 'Granite maul (or) (ornate handle)': 1 })
	},
	/**
	 *
	 * Upgrade kits
	 *
	 */
	{
		name: 'Mystic steam staff (or) (lms)',
		inputItems: new Bank({
			'Mystic steam staff': 1,
			'Steam staff upgrade kit': 1
		}),
		outputItems: new Bank({ 'Mystic steam staff (or)': 1 })
	},
	{
		name: 'Revert mystic steam staff (or)',
		inputItems: new Bank({
			'Mystic steam staff (or)': 1
		}),
		outputItems: new Bank({ 'Mystic steam staff': 1 }),
		noCl: true
	},
	//
	{
		name: 'Steam battlestaff (or)',
		inputItems: new Bank({
			'Steam battlestaff': 1,
			'Steam staff upgrade kit': 1
		}),
		outputItems: new Bank({ 'Steam battlestaff (or)': 1 })
	},
	{
		name: 'Revert steam battlestaff (or)',
		inputItems: new Bank({
			'Steam battlestaff (or)': 1
		}),
		outputItems: new Bank({ 'Steam battlestaff': 1 }),
		noCl: true
	},
	//
	{
		name: 'Mystic lava staff (or) (lms)',
		inputItems: new Bank({
			'Mystic lava staff': 1,
			'Lava staff upgrade kit': 1
		}),
		outputItems: new Bank({ 'Mystic lava staff (or)': 1 })
	},
	{
		name: 'Revert mystic lava staff (or)',
		inputItems: new Bank({
			'Mystic lava staff (or)': 1
		}),
		outputItems: new Bank({ 'Mystic lava staff': 1 }),
		noCl: true
	},
	//
	{
		name: 'Lava battlestaff (or)',
		inputItems: new Bank({
			'Lava battlestaff': 1,
			'Lava staff upgrade kit': 1
		}),
		outputItems: new Bank({ 'Lava battlestaff (or)': 1 })
	},
	{
		name: 'Revert lava battlestaff (or)',
		inputItems: new Bank({
			'Lava battlestaff (or)': 1
		}),
		outputItems: new Bank({ 'Lava battlestaff': 1 }),
		noCl: true
	},
	//
	{
		name: 'Dragon pickaxe (upgraded)',
		inputItems: new Bank({
			'Dragon pickaxe': 1,
			'Dragon pickaxe upgrade kit': 1
		}),
		outputItems: new Bank({ 'Dragon pickaxe (upgraded)': 1 })
	},
	{
		name: 'Revert dragon pickaxe (upgraded)',
		inputItems: new Bank({
			'Dragon pickaxe (upgraded)': 1
		}),
		outputItems: new Bank({ 'Dragon pickaxe': 1 }),
		noCl: true
	},
	//
	{
		name: 'Malediction ward (or)',
		inputItems: new Bank({
			'Malediction ward': 1,
			'Ward upgrade kit': 1
		}),
		outputItems: new Bank({ 'Malediction ward (or)': 1 })
	},
	{
		name: 'Revert malediction ward (or)',
		inputItems: new Bank({
			'Malediction ward (or)': 1
		}),
		outputItems: new Bank({ 'Malediction ward': 1 }),
		noCl: true
	},
	//
	{
		name: 'Odium ward (or)',
		inputItems: new Bank({
			'Odium ward': 1,
			'Ward upgrade kit': 1
		}),
		outputItems: new Bank({ 'Odium ward (or)': 1 })
	},
	{
		name: 'Revert odium ward (or)',
		inputItems: new Bank({
			'Odium ward (or)': 1
		}),
		outputItems: new Bank({ 'Odium ward': 1 }),
		noCl: true
	},
	/**
	 *
	 * Paints
	 *
	 */
	{
		name: 'Dark bow (green)',
		inputItems: new Bank({
			'Dark bow': 1,
			'Green dark bow paint': 1
		}),
		outputItems: new Bank({ 'Dark bow (green)': 1 })
	},
	{
		name: 'Revert dark bow (green)',
		inputItems: new Bank({
			'Dark bow (green)': 1
		}),
		outputItems: new Bank({ 'Dark bow': 1 }),
		noCl: true
	},
	//
	{
		name: 'Dark bow (blue)',
		inputItems: new Bank({
			'Dark bow': 1,
			'Blue dark bow paint': 1
		}),
		outputItems: new Bank({ 'Dark bow (blue)': 1 })
	},
	{
		name: 'Revert dark bow (blue)',
		inputItems: new Bank({
			'Dark bow (blue)': 1
		}),
		outputItems: new Bank({ 'Dark bow': 1 }),
		noCl: true
	},
	//
	{
		name: 'Dark bow (yellow)',
		inputItems: new Bank({
			'Dark bow': 1,
			'Yellow dark bow paint': 1
		}),
		outputItems: new Bank({ 'Dark bow (yellow)': 1 })
	},
	{
		name: 'Revert dark bow (yellow)',
		inputItems: new Bank({
			'Dark bow (yellow)': 1
		}),
		outputItems: new Bank({ 'Dark bow': 1 }),
		noCl: true
	},
	//
	{
		name: 'Dark bow (white)',
		inputItems: new Bank({
			'Dark bow': 1,
			'White dark bow paint': 1
		}),
		outputItems: new Bank({ 'Dark bow (white)': 1 })
	},
	{
		name: 'Revert dark bow (white)',
		inputItems: new Bank({
			'Dark bow (white)': 1
		}),
		outputItems: new Bank({ 'Dark bow': 1 }),
		noCl: true
	},
	/**
	 *
	 * Mixes
	 *
	 */
	{
		name: 'Volcanic abyssal whip',
		inputItems: new Bank({
			'Abyssal whip': 1,
			'Volcanic whip mix': 1
		}),
		outputItems: new Bank({ 'Volcanic abyssal whip': 1 })
	},
	{
		name: 'Revert volcanic abyssal whip',
		inputItems: new Bank({
			'Volcanic abyssal whip': 1
		}),
		outputItems: new Bank({ 'Abyssal whip': 1 }),
		noCl: true
	},
	//
	{
		name: 'Frozen abyssal whip',
		inputItems: new Bank({
			'Abyssal whip': 1,
			'Frozen whip mix': 1
		}),
		outputItems: new Bank({ 'Frozen abyssal whip': 1 })
	},
	{
		name: 'Revert frozen abyssal whip',
		inputItems: new Bank({
			'Frozen abyssal whip': 1
		}),
		outputItems: new Bank({ 'Abyssal whip': 1 }),
		noCl: true
	},
	/**
	 *
	 * Other
	 *
	 */
	{
		name: 'Staff of balance',
		inputItems: new Bank({
			'Staff of the dead': 1,
			'Guthixian icon': 1
		}),
		outputItems: new Bank({ 'Staff of balance': 1 })
	},
	{
		name: "Saradomin's blessed sword",
		inputItems: new Bank({
			'Saradomin sword': 1,
			"Saradomin's tear": 1
		}),
		outputItems: new Bank({ "Saradomin's blessed sword": 1 })
	},
	{
		name: 'Magic shortbow (i)',
		inputItems: new Bank({
			'Magic shortbow': 1,
			'Magic shortbow scroll': 1
		}),
		outputItems: new Bank({ 'Magic shortbow (i)': 1 })
	},
	{
		name: 'Looting bag',
		inputItems: new Bank({
			'Looting bag note': 1
		}),
		outputItems: new Bank({ 'Looting bag': 1 })
	},
	{
		name: 'Rune pouch',
		inputItems: new Bank({
			'Rune pouch note': 1
		}),
		outputItems: new Bank({ 'Rune pouch': 1 })
	}
];
