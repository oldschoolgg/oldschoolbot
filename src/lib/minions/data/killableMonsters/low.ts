import { Monsters } from 'oldschooljs';

import { Time } from '../../../constants';
import { GearSetupTypes, GearStat } from '../../../gear/types';
import { KillableMonster } from '../../types';

const killableMonsters: KillableMonster[] = [
	{
		id: Monsters.Imp.id,
		name: Monsters.Imp.name,
		aliases: Monsters.Imp.aliases,
		timeToFinish: Time.Second * 13,
		table: Monsters.Imp,
		wildy: false,
		canBeKilled: false,
		difficultyRating: 5,
		qpRequired: 0
	},
	/*
	{
		id: Monsters.EarthWarrior.id,
		name: Monsters.EarthWarrior.name,
		aliases: Monsters.EarthWarrior.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.EarthWarrior,
		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 1.5,
		healAmountNeeded: 14,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Ghoul.id,
		name: Monsters.Ghoul.name,
		aliases: Monsters.Ghoul.aliases,
		timeToFinish: Time.Second * 17.5,
		table: Monsters.Ghoul,

		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 1.5,
		healAmountNeeded: 7,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Hobgoblin.id,
		name: Monsters.Hobgoblin.name,
		aliases: Monsters.Hobgoblin.aliases,
		timeToFinish: Time.Second * 14.5,
		table: Monsters.Hobgoblin,

		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 1.5,
		healAmountNeeded: 15,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	 */
	{
		id: Monsters.Jogre.id,
		name: Monsters.Jogre.name,
		aliases: Monsters.Jogre.aliases,
		timeToFinish: Time.Second * 19.5,
		table: Monsters.Jogre,

		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 1.5,
		healAmountNeeded: 14,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	/*
	{
		id: Monsters.ChaosDruid.id,
		name: Monsters.ChaosDruid.name,
		aliases: Monsters.ChaosDruid.aliases,
		timeToFinish: Time.Second * 17.5,
		table: Monsters.ChaosDruid,

		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second,
		healAmountNeeded: 10,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	 */
	{
		id: Monsters.Unicorn.id,
		name: Monsters.Unicorn.name,
		aliases: Monsters.Unicorn.aliases,
		timeToFinish: Time.Second * 15.5,
		table: Monsters.Unicorn,

		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 10,
		healAmountNeeded: 8,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	}
];

export default killableMonsters;
