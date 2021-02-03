import { Bank } from 'oldschooljs';
import { itemID } from 'oldschooljs/dist/util';

interface Castable {
	id: number;
	input: Bank;
	output: Bank | null;
	name: string;
	level: number;
	xp: number;
	ticks: number;
}

export const Castables: Castable[] = [
	{
		id: itemID('Banana'),
		name: 'Bones to Bananas',
		input: new Bank()
			.add('Bones', 25)
			.add('Earth rune', 2)
			.add('Water rune', 2)
			.add('Nature rune', 1),
		output: new Bank().add('Banana', 25),
		xp: 25,
		level: 15,
		ticks: 1
	},
	{
		id: itemID('Camelot Teleport'),
		name: 'Camelot Teleport',
		input: new Bank().add('Law rune', 1).add('Air rune', 5),
		output: null,
		xp: 55.5,
		level: 45,
		ticks: 5
	}
];
