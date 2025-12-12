import type { DisassemblySourceGroup } from '@/lib/bso/skills/invention/index.js';

import { Items } from 'oldschooljs';

const i = Items.getOrThrow.bind(Items);

export const Jewellery: DisassemblySourceGroup = {
	name: 'Jewellery',
	items: [
		{ item: ['Opal ring', 'Ring of pursuit'].map(i), lvl: 1 },
		{ item: i('Gold ring'), lvl: 5 },
		{ item: i('Gold necklace'), lvl: 6 },
		{ item: i('Gold bracelet'), lvl: 7 },
		{ item: ['Gold amulet (u)', 'Gold amulet'].map(i), lvl: 8 },
		{
			item: [
				'Jade ring',
				'Ring of returning(1)',
				'Ring of returning(2)',
				'Ring of returning(3)',
				'Ring of returning(4)',
				'Ring of returning(5)'
			].map(i),
			lvl: 13
		},
		{ item: ['Topaz ring', "Efaritay's aid"].map(i), lvl: 16 },
		{ item: ['Unstrung symbol', 'Unblessed symbol', 'Holy symbol'].map(i), lvl: 16 },
		{ item: ['Opal necklace', 'Dodgy necklace'].map(i), lvl: 16 },
		{ item: ['Sapphire ring', 'Ring of recoil'].map(i), lvl: 20 },

		{
			item: [
				'Sapphire necklace',
				'Games necklace(1)',
				'Games necklace(2)',
				'Games necklace(3)',
				'Games necklace(4)',
				'Games necklace(5)',
				'Games necklace(6)',
				'Games necklace(7)',
				'Games necklace(8)'
			].map(i),
			lvl: 22
		},

		{ item: ['Opal bracelet', 'Expeditious bracelet'].map(i), lvl: 22 },
		{ item: ['Sapphire bracelet', 'Bracelet of clay'].map(i), lvl: 23 },
		{ item: ['Sapphire amulet (u)', 'Sapphire amulet', 'Amulet of magic'].map(i), lvl: 24 },
		{
			item: [
				'Jade necklace',
				'Necklace of passage(1)',
				'Necklace of passage(2)',
				'Necklace of passage(3)',
				'Necklace of passage(4)',
				'Necklace of passage(5)'
			].map(i),
			lvl: 25
		},
		{
			item: ['Opal amulet (u)', 'Opal amulet', 'Amulet of bounty'].map(i),
			lvl: 27
		},
		{
			item: [
				'Emerald ring',
				'Ring of dueling(1)',
				'Ring of dueling(2)',
				'Ring of dueling(3)',
				'Ring of dueling(4)',
				'Ring of dueling(5)',
				'Ring of dueling(6)',
				'Ring of dueling(7)',
				'Ring of dueling(8)'
			].map(i),
			lvl: 27
		},

		{ item: ['Emerald necklace', 'Binding necklace'].map(i), lvl: 29 },
		{ item: ['Jade bracelet', 'Flamtaer bracelet'].map(i), lvl: 29 },
		{
			item: [
				'Emerald bracelet',
				'Castle wars bracelet(1)',
				'Castle wars bracelet(2)',
				'Castle wars bracelet(3)'
			].map(i),
			lvl: 30
		},
		{ item: ['Emerald amulet (u)', 'Emerald amulet', 'Pre-nature amulet', 'Amulet of defence'].map(i), lvl: 31 },
		{ item: ['Topaz necklace', 'Necklace of faith'].map(i), lvl: 32 },
		{ item: ['Jade amulet (u)', 'Jade amulet', 'Amulet of chemistry'].map(i), lvl: 34 },
		{ item: ['Ruby ring', 'Ring of forging'].map(i), lvl: 34 },
		{ item: ['Topaz bracelet', 'Bracelet of slaughter'].map(i), lvl: 38 },
		{
			item: [
				'Ruby necklace',
				'Digsite pendant(1)',
				'Digsite pendant(2)',
				'Digsite pendant(3)',
				'Digsite pendant(4)',
				'Digsite pendant(5)'
			].map(i),
			lvl: 40
		},
		{ item: ['Ruby bracelet', 'Inoculation bracelet'].map(i), lvl: 42 },
		{ item: i('Gold tiara'), lvl: 42 },
		{ item: ['Diamond ring', 'Ring of life'].map(i), lvl: 43 },
		{
			item: [
				'Topaz amulet (u)',
				'Topaz amulet',
				'Burning amulet(1)',
				'Burning amulet(2)',
				'Burning amulet(3)',
				'Burning amulet(4)',
				'Burning amulet(5)'
			].map(i),
			lvl: 45
		},
		{
			item: ['Ruby amulet (u)', 'Ruby amulet', 'Amulet of strength'].map(i),
			lvl: 50
		},
		{
			item: [
				'Dragonstone ring',
				'Ring of wealth',
				'Ring of wealth(1)',
				'Ring of wealth(2)',
				'Ring of wealth(3)',
				'Ring of wealth(4)',
				'Ring of wealth(5)'
			].map(i),
			lvl: 55
		},
		{ item: ['Diamond necklace', 'Phoenix necklace'].map(i), lvl: 56 },
		{
			item: [
				'Diamond bracelet',
				'Abyssal bracelet(1)',
				'Abyssal bracelet(2)',
				'Abyssal bracelet(3)',
				'Abyssal bracelet(4)',
				'Abyssal bracelet(5)'
			].map(i),
			lvl: 58
		},
		{ item: ['Onyx ring', 'Ring of stone'].map(i), lvl: 67 },
		{ item: ['Diamond amulet (u)', 'Diamond amulet', 'Amulet of power'].map(i), lvl: 70 },
		{
			item: [
				'Dragon necklace',
				'Skills necklace',
				'Skills necklace(1)',
				'Skills necklace(2)',
				'Skills necklace(3)',
				'Skills necklace(4)',
				'Skills necklace(5)',
				'Skills necklace(6)'
			].map(i),
			lvl: 72
		},
		{
			item: [
				'Dragonstone bracelet',
				'Combat bracelet',
				'Combat bracelet(1)',
				'Combat bracelet(2)',
				'Combat bracelet(3)',
				'Combat bracelet(4)'
			].map(i),
			lvl: 74
		},
		{
			item: [
				'Slayer ring(1)',
				'Slayer ring(2)',
				'Slayer ring(3)',
				'Slayer ring(4)',
				'Slayer ring(5)',
				'Slayer ring(6)',
				'Slayer ring(7)',
				'Slayer ring(8)'
			].map(i),
			lvl: 75
		},
		{
			item: [
				'Dragonstone amulet (u)',
				'Dragonstone amulet',
				'Amulet of glory',
				'Amulet of glory(1)',
				'Amulet of glory(2)',
				'Amulet of glory(3)',
				'Amulet of glory(4)',
				'Amulet of glory(5)',
				'Amulet of glory(6)',
				'Amulet of glory (t)',
				'Amulet of glory (t1)',
				'Amulet of glory (t2)',
				'Amulet of glory (t3)',
				'Amulet of glory (t4)',
				'Amulet of glory (t5)',
				'Amulet of glory (t6)'
			].map(i),
			lvl: 80
		},
		{ item: ['Archers ring', 'Seers ring', 'Berserker ring', 'Warrior ring', 'Ring of coins'].map(i), lvl: 80 },
		{ item: ['Onyx necklace', 'Berserker necklace'].map(i), lvl: 82 },
		{ item: ['Onyx bracelet', 'Regen bracelet'].map(i), lvl: 84 },
		{ item: ['Amulet of rancour', 'Amulet of rancour (s)'].map(i), lvl: 86 },
		{ item: ['Zenyte ring', 'Ring of suffering', 'Ring of suffering (r)'].map(i), lvl: 89 },
		{ item: ['Onyx amulet (u)', 'Onyx amulet', 'Amulet of fury'].map(i), lvl: 90 },
		{ item: ['Zenyte necklace', 'Necklace of anguish'].map(i), lvl: 92 },
		{ item: ['Zenyte bracelet', 'Tormented bracelet'].map(i), lvl: 95 },
		{ item: ['Zenyte amulet (u)', 'Zenyte amulet', 'Amulet of torture'].map(i), lvl: 98 }
	],
	parts: { precious: 20, smooth: 80 }
};
