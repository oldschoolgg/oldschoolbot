import { Bank, Items } from 'oldschooljs';

import type { Createable } from '@/lib/data/createables.js';

export const bsoShadesOfMortonCreatables: Createable[] = [
	{
		name: 'Necromancer outfit',
		inputItems: new Bank({
			"Dagon'hai robes set": 1,
			'Necromancer kit': 3,
			'Fine cloth': 50
		}),
		outputItems: new Bank().add('Necromancer hood').add('Necromancer robe top').add('Necromancer robe bottom')
	}
];

const skeletalStaves = [
	["Necromancer's air staff", 'Mystic air staff'],
	["Necromancer's earth staff", 'Mystic earth staff'],
	["Necromancer's fire staff", 'Mystic fire staff'],
	["Necromancer's lava staff", 'Mystic lava staff'],
	["Necromancer's mud staff", 'Mystic mud staff'],
	["Necromancer's steam staff", 'Mystic steam staff'],
	["Necromancer's water staff", 'Mystic water staff'],
	['Skeletal battlestaff of air', 'Air battlestaff'],
	['Skeletal battlestaff of earth', 'Earth battlestaff'],
	['Skeletal battlestaff of fire', 'Fire battlestaff'],
	['Skeletal battlestaff of water', 'Water battlestaff'],
	['Skeletal lava battlestaff', 'Lava battlestaff'],
	['Skeletal mud battlestaff', 'Mud battlestaff'],
	['Skeletal steam battlestaff', 'Steam battlestaff']
] as const;

// For each staff, add ability to create it with shade skull, and revert it, getting both items back, like ornament kits.
for (const [nec, src] of skeletalStaves) {
	const necStaff = Items.getOrThrow(nec);
	const srcStaff = Items.getOrThrow(src);
	bsoShadesOfMortonCreatables.push({
		name: necStaff.name,
		inputItems: new Bank().add('Shade skull').add(srcStaff.id),
		outputItems: new Bank().add(necStaff.id)
	});
	bsoShadesOfMortonCreatables.push({
		name: `Revert ${necStaff.name}`,
		inputItems: new Bank().add(necStaff.id),
		outputItems: new Bank().add('Shade skull').add(srcStaff.id),
		noCl: true
	});
}
