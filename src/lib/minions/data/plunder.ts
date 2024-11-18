import { randInt } from 'e';
import { Bank } from 'oldschooljs';
import { LootTable } from 'oldschooljs';

import { SkillsEnum } from '../../skilling/types';
import { roll, skillingPetDropRate } from '../../util';
import type { MUserClass } from './../../MUser';

const Room1Table = new LootTable().add('Ivory Comb', 1, 3).add('Pottery scarab').add('Pottery statuette');

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
		rockyChance: 41_355,
		roomTable: Room1Table,
		sceptreChance: 3500
	},
	{
		number: 2,
		thievingLevel: 31,
		xp: 1165,
		rockyChance: 29_540,
		roomTable: Room2Table,
		sceptreChance: 2250
	},
	{
		number: 3,
		thievingLevel: 41,
		xp: 2005,
		rockyChance: 25_847,
		roomTable: Room3Table,
		sceptreChance: 1250
	},
	{
		number: 4,
		thievingLevel: 51,
		xp: 2958,
		rockyChance: 20_678,
		roomTable: Room4Table,
		sceptreChance: 750
	},
	{
		number: 5,
		thievingLevel: 61,
		xp: 4280,
		rockyChance: 20_678,
		roomTable: Room5Table,
		sceptreChance: 650
	},
	{
		number: 6,
		thievingLevel: 71,
		xp: 6465,
		rockyChance: 20_678,
		roomTable: Room6Table,
		sceptreChance: 650
	},
	{
		number: 7,
		thievingLevel: 81,
		xp: 9738,
		rockyChance: 10_339,
		roomTable: Room7Table,
		sceptreChance: 650
	},
	{
		number: 8,
		thievingLevel: 91,
		xp: 12_665,
		rockyChance: 6893,
		roomTable: Room8Table,
		sceptreChance: 650
	}
];

export const plunderBoosts = new Bank({
	"Pharaoh's sceptre": 5
});

export function lootRoom(user: MUserClass, room: number): [Bank, number] {
	const loot = new Bank();
	const roomObj = plunderRooms[room - 1];
	const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Thieving, roomObj.rockyChance);
	if (roll(petDropRate)) {
		loot.add('Rocky');
	}

	for (let i = 0; i < 2; i++) {
		if (roll(roomObj.sceptreChance)) {
			loot.add("Pharaoh's sceptre");
			break;
		}
	}

	const amountUrns = randInt(9, 14);
	for (let i = 0; i < amountUrns; i++) {
		loot.add(roomObj.roomTable.roll());
	}
	return [loot, amountUrns];
}
