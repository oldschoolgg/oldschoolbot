import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { ItemBank } from '../../types';
import { roll } from '../../util';

const Room1Table = new LootTable()
	.add('Ivory Comb', 1, 3)
	.add('Pottery scarab')
	.add('Pottery statuette');

const Room2Table = new LootTable().add('Ivory Comb').add('Pottery scarab').add('Pottery statuette');

const Room3Table = new LootTable()
	.add('Pottery scarab', 1, 2)
	.add('Pottery statuette', 1, 2)
	.add('Stone seal')
	.add('Stone scarab')
	.add('Stone statuette');

const Room4Table = new LootTable()
	.add('Pottery scarab')
	.add('Pottery statuette')
	.add('Stone seal')
	.add('Stone scarab')
	.add('Stone statuette');

const Room5Table = new LootTable()
	.add('Pottery scarab')
	.add('Pottery statuette')
	.add('Stone seal', 1, 2)
	.add('Stone scarab', 1, 2)
	.add('Stone statuette', 1, 2);

const Room6Table = new LootTable()
	.add('Stone seal', 1, 2)
	.add('Stone scarab', 1, 2)
	.add('Stone statuette', 1, 2)
	.add('Gold seal')
	.add('Golden scarab')
	.add('Golden statuette');

const Room7Table = new LootTable()
	.add('Stone seal')
	.add('Stone scarab')
	.add('Stone statuette')
	.add('Gold seal')
	.add('Golden scarab')
	.add('Golden statuette');

const Room8Table = new LootTable()
	.add('Stone seal')
	.add('Stone scarab')
	.add('Stone statuette')
	.add('Gold seal', 1, 2)
	.add('Golden scarab', 1, 2)
	.add('Golden statuette', 1, 2);

export const plunderRooms = [
	{
		number: 1,
		thievingLevel: 21,
		xp: 720,
		rockyChance: 41355,
		roomTable: Room1Table
	},
	{
		number: 2,
		thievingLevel: 31,
		xp: 1165,
		rockyChance: 29540,
		roomTable: Room2Table
	},
	{
		number: 3,
		thievingLevel: 41,
		xp: 2005,
		rockyChance: 25847,
		roomTable: Room3Table
	},
	{
		number: 4,
		thievingLevel: 51,
		xp: 2958,
		rockyChance: 20678,
		roomTable: Room4Table
	},
	{
		number: 5,
		thievingLevel: 61,
		xp: 4280,
		rockyChance: 20678,
		roomTable: Room5Table
	},
	{
		number: 6,
		thievingLevel: 71,
		xp: 6465,
		rockyChance: 20678,
		roomTable: Room6Table
	},
	{
		number: 7,
		petChance: 2000,
		thievingLevel: 71,
		xp: 9738,
		rockyChance: 10339,
		roomTable: Room7Table
	},
	{
		number: 8,
		petChance: 2000,
		thievingLevel: 91,
		xp: 12423,
		rockyChance: 6893,
		roomTable: Room8Table
	}
];

export const plunderBoosts = resolveNameBank({
	"Pharaoh's sceptre (3)": 5
});

export function lootRoom(room: number): ItemBank {
	const loot = new Bank();
	const sceptreChance = 1000;
	const roomObj = plunderRooms[room - 1];

	if (roll(roomObj.rockyChance)) {
		loot.add('Rocky');
	}

	for (let i = 0; i < 2; i++) {
		if (roll(sceptreChance)) {
			loot.add("Pharaoh's sceptre (3)");
			break;
		}
	}

	for (let i = 0; i < 14; i++) {
		loot.add(roomObj.roomTable.roll());
	}
	return loot.bank;
}
