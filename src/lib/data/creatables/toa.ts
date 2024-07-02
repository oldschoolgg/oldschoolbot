import { Bank } from 'oldschooljs';

import getOSItem from '../../util/getOSItem';
import type { Createable } from '../createables';

export const toaCreatables: Createable[] = [
	{
		name: 'Masori assembler',
		inputItems: new Bank({
			'Masori crafting kit': 1,
			"Ava's assembler": 1
		}),
		outputItems: new Bank({ 'Masori assembler': 1 })
	},
	{
		name: "Osmumten's fang (or)",
		inputItems: new Bank({
			"Osmumten's fang": 1,
			'Cursed phalanx': 1
		}),
		outputItems: new Bank({ "Osmumten's fang (or)": 1 })
	},
	{
		name: "Elidinis' ward (f)",
		inputItems: new Bank({
			"Elidinis' ward": 1,
			'Arcane sigil': 1,
			'Soul rune': 10_000
		}),
		outputItems: new Bank({ "Elidinis' ward (f)": 1 }),
		requiredSkills: {
			prayer: 90,
			smithing: 90
		}
	},
	{
		name: "Revert Elidinis' ward (f)",
		inputItems: new Bank({ "Elidinis' ward (f)": 1 }),
		outputItems: new Bank({
			"Elidinis' ward": 1,
			'Arcane sigil': 1
		}),
		noCl: true
	},
	{
		name: "Elidinis' ward (or)",
		inputItems: new Bank({
			"Elidinis' ward (f)": 1,
			'Menaphite ornament kit': 1
		}),
		outputItems: new Bank({ "Elidinis' ward (or)": 1 })
	},
	{
		name: "Revert Elidinis' ward (or)",
		inputItems: new Bank({ "Elidinis' ward (or)": 1 }),
		outputItems: new Bank({
			"Elidinis' ward (f)": 1,
			'Menaphite ornament kit': 1
		}),
		noCl: true
	},
	{
		name: 'Divine rune pouch',
		inputItems: new Bank({
			'Rune pouch': 1,
			'Thread of elidinis': 1
		}),
		outputItems: new Bank({ 'Divine rune pouch': 1 })
	},
	{
		name: 'Masori mask (f)',
		inputItems: new Bank({
			'Armadylean plate': 1,
			'Masori mask': 1
		}),
		outputItems: new Bank({ 'Masori mask (f)': 1 })
	},
	{
		name: 'Masori body (f)',
		inputItems: new Bank({
			'Armadylean plate': 4,
			'Masori body': 1
		}),
		outputItems: new Bank({ 'Masori body (f)': 1 })
	},
	{
		name: 'Masori chaps (f)',
		inputItems: new Bank({
			'Armadylean plate': 3,
			'Masori chaps': 1
		}),
		outputItems: new Bank({ 'Masori chaps (f)': 1 })
	},
	{
		name: 'Revert Armadyl helmet',
		inputItems: new Bank({
			'Armadyl helmet': 1
		}),
		outputItems: new Bank({ 'Armadylean plate': 1 }),
		forceAddToCl: true
	},
	{
		name: 'Revert Armadyl chestplate',
		inputItems: new Bank({
			'Armadyl chestplate': 1
		}),
		outputItems: new Bank({ 'Armadylean plate': 4 }),
		forceAddToCl: true
	},
	{
		name: 'Revert Armadyl chainskirt',
		inputItems: new Bank({
			'Armadyl chainskirt': 1
		}),
		outputItems: new Bank({ 'Armadylean plate': 3 }),
		forceAddToCl: true
	},
	{
		name: 'Keris partisan of breaching',
		inputItems: new Bank({
			'Keris partisan': 1,
			'Breach of the scarab': 1
		}),
		outputItems: new Bank({ 'Keris partisan of breaching': 1 })
	},
	{
		name: 'Keris partisan of corruption',
		inputItems: new Bank({
			'Keris partisan': 1,
			'Eye of the corruptor': 1
		}),
		outputItems: new Bank({ 'Keris partisan of corruption': 1 })
	},
	{
		name: 'Keris partisan of the sun',
		inputItems: new Bank({
			'Keris partisan': 1,
			'Jewel of the sun': 1
		}),
		outputItems: new Bank({ 'Keris partisan of the sun': 1 })
	},
	{
		name: 'Revert Masori assembler',
		inputItems: new Bank({
			'Masori assembler': 1
		}),
		outputItems: new Bank({ 'Masori crafting kit': 1, "Ava's assembler": 1 }),
		noCl: true
	}
];

const transMogPets = [
	['Remnant of akkha', 'Akkhito'],
	['Remnant of ba-ba', 'Babi'],
	['Remnant of kephri', 'Kephriti'],
	['Ancient remnant', "Tumeken's damaged guardian"],
	['Ancient remnant', "Elidinis' damaged guardian"],
	['Remnant of zebak', 'Zebo']
] as const;

for (const [ornament, _pet] of transMogPets) {
	const ornKit = getOSItem(ornament);
	const pet = getOSItem(_pet);
	toaCreatables.push({
		name: `${pet.name}`,
		inputItems: new Bank().add(ornKit.id).add("Tumeken's guardian"),
		outputItems: new Bank().add(pet.id)
	});
	toaCreatables.push({
		name: `Revert ${pet.name}`,
		inputItems: new Bank().add(pet.id),
		outputItems: new Bank().add("Tumeken's guardian").add(ornKit.id),
		noCl: true
	});
}

const spiritShields = [['Arcane sigil', 'Arcane spirit shield']] as const;

for (const [_sigil, _shield] of spiritShields) {
	const sigil = getOSItem(_sigil);
	const shield = getOSItem(_shield);
	toaCreatables.push({
		name: `Revert ${shield.name}`,
		inputItems: new Bank().add(shield.id),
		outputItems: new Bank().add(sigil.id)
	});
}
