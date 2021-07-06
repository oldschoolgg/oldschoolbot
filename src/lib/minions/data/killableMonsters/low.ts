import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import CommonSeedDropTable from 'oldschooljs/dist/simulation/subtables/CommonSeedDropTable';
import { GemTable } from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { GearStat } from '../../../gear/types';
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
					.tertiary(6500, 'Ishi')
			)
		},
		emoji: '',
		wildy: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 30,
		healAmountNeeded: 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	}
];

export default killableMonsters;
