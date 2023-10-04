import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import { KillableMonster } from '../../types';

export const revenantMonsters: KillableMonster[] = [
	{
		id: Monsters.RevenantCyclops.id,
		name: Monsters.RevenantCyclops.name,
		aliases: Monsters.RevenantCyclops.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.RevenantCyclops,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 6,
		pkBaseDeathChance: 5
	},
	{
		id: Monsters.RevenantDarkBeast.id,
		name: Monsters.RevenantDarkBeast.name,
		aliases: Monsters.RevenantDarkBeast.aliases,
		timeToFinish: Time.Second * 70,
		table: Monsters.RevenantDarkBeast,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 9,
		pkBaseDeathChance: 4
	},
	{
		id: Monsters.RevenantDemon.id,
		name: Monsters.RevenantDemon.name,
		aliases: Monsters.RevenantDemon.aliases,
		timeToFinish: Time.Second * 50,
		table: Monsters.RevenantDemon,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 6,
		pkBaseDeathChance: 5
	},
	{
		id: Monsters.RevenantDragon.id,
		name: Monsters.RevenantDragon.name,
		aliases: Monsters.RevenantDragon.aliases,
		timeToFinish: Time.Second * 90,
		table: Monsters.RevenantDragon,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 8,
		pkBaseDeathChance: 7
	},
	{
		id: Monsters.RevenantGoblin.id,
		name: Monsters.RevenantGoblin.name,
		aliases: Monsters.RevenantGoblin.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.RevenantGoblin,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 5,
		pkBaseDeathChance: 5
	},
	{
		id: Monsters.RevenantHellhound.id,
		name: Monsters.RevenantHellhound.name,
		aliases: Monsters.RevenantHellhound.aliases,
		timeToFinish: Time.Second * 55,
		table: Monsters.RevenantHellhound,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 6,
		pkBaseDeathChance: 5
	},
	{
		id: Monsters.RevenantHobgoblin.id,
		name: Monsters.RevenantHobgoblin.name,
		aliases: Monsters.RevenantHobgoblin.aliases,
		timeToFinish: Time.Second * 45,
		table: Monsters.RevenantHobgoblin,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 5,
		pkBaseDeathChance: 5
	},
	{
		id: Monsters.RevenantImp.id,
		name: Monsters.RevenantImp.name,
		aliases: Monsters.RevenantImp.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.RevenantImp,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 4,
		pkBaseDeathChance: 3
	},
	{
		id: Monsters.RevenantKnight.id,
		name: Monsters.RevenantKnight.name,
		aliases: Monsters.RevenantKnight.aliases,
		timeToFinish: Time.Second * 75,
		table: Monsters.RevenantKnight,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 8,
		pkBaseDeathChance: 6
	},
	{
		id: Monsters.RevenantOrk.id,
		name: Monsters.RevenantOrk.name,
		aliases: Monsters.RevenantOrk.aliases,
		timeToFinish: Time.Second * 65,
		table: Monsters.RevenantOrk,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 7,
		pkBaseDeathChance: 6
	},
	{
		id: Monsters.RevenantPyrefiend.id,
		name: Monsters.RevenantPyrefiend.name,
		aliases: Monsters.RevenantPyrefiend.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.RevenantPyrefiend,
		wildy: true,
		difficultyRating: 9,
		qpRequired: 0,
		pkActivityRating: 7,
		pkBaseDeathChance: 5
	}
];
