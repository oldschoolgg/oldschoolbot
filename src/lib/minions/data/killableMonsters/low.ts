import { Monsters } from 'oldschooljs';
import CommonSeedDropTable from 'oldschooljs/dist/simulation/subtables/CommonSeedDropTable';
import { GemTable } from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Time } from '../../../constants';
import { GearSetupTypes, GearStat } from '../../../gear/types';
import { RuneTable } from '../../../simulation/seedTable';
import { makeKillTable } from '../../../util/setCustomMonster';
import { KillableMonster } from '../../types';

const killableMonsters: KillableMonster[] = [
	{
		id: Monsters.Imp.id,
		name: Monsters.Imp.name,
		aliases: Monsters.Imp.aliases,
		timeToFinish: Time.Second * 13,
		table: Monsters.Imp,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 5,
		qpRequired: 0
	},
	{
		id: Monsters.EarthWarrior.id,
		name: Monsters.EarthWarrior.name,
		aliases: Monsters.EarthWarrior.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.EarthWarrior,
		emoji: '',
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
		emoji: '',
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
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 1.5,
		healAmountNeeded: 15,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Jogre.id,
		name: Monsters.Jogre.name,
		aliases: Monsters.Jogre.aliases,
		timeToFinish: Time.Second * 19.5,
		table: Monsters.Jogre,
		emoji: '',
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
		id: Monsters.ChaosDruid.id,
		name: Monsters.ChaosDruid.name,
		aliases: Monsters.ChaosDruid.aliases,
		timeToFinish: Time.Second * 17.5,
		table: Monsters.ChaosDruid,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second,
		healAmountNeeded: 10,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Unicorn.id,
		name: Monsters.Unicorn.name,
		aliases: Monsters.Unicorn.aliases,
		timeToFinish: Time.Second * 15.5,
		table: Monsters.Unicorn,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 10,
		healAmountNeeded: 8,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: 7989,
		name: 'Ogress Warrior',
		aliases: ['ogress warrior'],
		timeToFinish: Time.Second * 15.5,
		table: {
			kill: makeKillTable(
				new LootTable()
					.every('Big bones')
					.add('Mithril kiteshield', 1, 7)
					.add('Mithril arrow', [5, 15], 7)
					.add('Steel arrow', [5, 15], 5)
					.add('Iron arrow', [5, 15], 5)
					.add(RuneTable, 1, 45)
					.add(CommonSeedDropTable, 1, 5)
					.add(GemTable, 1, 20)
					.tertiary(5000, 'Curved bone')
					.tertiary(400, 'Long bone')
					.tertiary(1200, 'Shaman mask')
					.tertiary(3500, 'Ishi')
			)
		},
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 30,
		healAmountNeeded: 20,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackSlash]
	}
];

export default killableMonsters;
