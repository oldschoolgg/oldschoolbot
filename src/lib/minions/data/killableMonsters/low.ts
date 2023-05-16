import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import { GearStat } from '../../../gear/types';
import { KillableMonster } from '../../types';

const killableMonsters: KillableMonster[] = [
	{
		id: Monsters.Imp.id,
		name: Monsters.Imp.name,
		aliases: Monsters.Imp.aliases,
		timeToFinish: Time.Second * 13,
		table: Monsters.Imp,
		wildy: false,
		difficultyRating: 5,
		qpRequired: 0
	},
	{
		id: Monsters.Jogre.id,
		name: Monsters.Jogre.name,
		aliases: Monsters.Jogre.aliases,
		timeToFinish: Time.Second * 19.5,
		table: Monsters.Jogre,
		wildy: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 1.5,
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Unicorn.id,
		name: Monsters.Unicorn.name,
		aliases: Monsters.Unicorn.aliases,
		timeToFinish: Time.Second * 15.5,
		table: Monsters.Unicorn,
		wildy: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 10,
		healAmountNeeded: 8,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Goat.id,
		name: Monsters.Goat.name,
		aliases: Monsters.Goat.aliases,
		timeToFinish: Time.Second * 28.2,
		table: Monsters.Goat,
		wildy: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 30,
		healAmountNeeded: 10,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.TzHaarXil.id,
		name: Monsters.TzHaarXil.name,
		aliases: Monsters.TzHaarXil.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.TzHaarXil,
		wildy: false,
		difficultyRating: 2,
		qpRequired: 0,
		canBarrage: false,
		healAmountNeeded: 50,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.TzHaarMej.id,
		name: Monsters.TzHaarMej.name,
		aliases: Monsters.TzHaarMej.aliases,
		timeToFinish: Time.Second * 28,
		table: Monsters.TzHaarMej,
		wildy: false,
		difficultyRating: 2,
		qpRequired: 0,
		canBarrage: false,
		healAmountNeeded: 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.GiantFrog.id,
		name: Monsters.GiantFrog.name,
		aliases: Monsters.GiantFrog.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.GiantFrog,
		healAmountNeeded: 30,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.JubblyBird.id,
		name: Monsters.JubblyBird.name,
		aliases: Monsters.JubblyBird.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.JubblyBird,
		qpRequired: 10
	}
];

export default killableMonsters;
