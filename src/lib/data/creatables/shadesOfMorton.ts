import { Bank } from 'oldschooljs';


export const shadesOfMortonCreatables: Createable[] = [
	{
		name: 'Bronze coffin',
		inputItems: new Bank({
			'Bronze locks': 1,
			'Broken coffin': 1
		}),
		outputItems: new Bank({ 'Bronze coffin': 1 })
	},
	{
		name: 'Steel coffin',
		inputItems: new Bank({
			'Steel locks': 1,
			'Bronze coffin': 1
		}),
		outputItems: new Bank({ 'Steel coffin': 1 })
	},
	{
		name: 'Black coffin',
		inputItems: new Bank({
			'Black locks': 1,
			'Steel coffin': 1
		}),
		outputItems: new Bank({ 'Black coffin': 1 })
	},
	{
		name: 'Silver coffin',
		inputItems: new Bank({
			'Silver locks': 1,
			'Black coffin': 1
		}),
		outputItems: new Bank({ 'Silver coffin': 1 })
	},
	{
		name: 'Gold coffin',
		inputItems: new Bank({
			'Gold locks': 1,
			'Silver coffin': 1
		}),
		outputItems: new Bank({ 'Gold coffin': 1 })
	},
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
	const necStaff = getOSItem(nec);
	const srcStaff = getOSItem(src);
	shadesOfMortonCreatables.push({
		name: necStaff.name,
		inputItems: new Bank().add('Shade skull').add(srcStaff.id),
		outputItems: new Bank().add(necStaff.id)
	});
	shadesOfMortonCreatables.push({
		name: `Revert ${necStaff.name}`,
		inputItems: new Bank().add(necStaff.id),
		outputItems: new Bank().add('Shade skull').add(srcStaff.id),
		noCl: true
	});
}
