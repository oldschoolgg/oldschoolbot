import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Time } from './constants';
import { GearSetupTypes, GearStat } from './gear/types';
import { GrimyHerbTable } from './minions/data/killableMonsters/custom/Treebeard';
import { KillableMonster } from './minions/types';
import { SeedTable } from './simulation/seedTable';
import resolveItems from './util/resolveItems';
import { makeKillTable } from './util/setCustomMonster';

export const allKalphiteKingItems = resolveItems([
	'Drygore rapier',
	'Drygore longsword',
	'Drygore mace',
	'Offhand drygore rapier',
	'Offhand drygore longsword',
	'Offhand drygore mace',
	'Baby kalphite king',
	'Perfect chitlin'
]);

export const KalphiteKingMonster: KillableMonster = {
	id: 23483,
	name: 'Kalphite King',
	aliases: ['kk'],
	timeToFinish: Time.Minute * 25,
	notifyDrops: allKalphiteKingItems,
	table: {
		kill: makeKillTable(
			new LootTable()
				.tertiary(40, 'Clue scroll grandmaster')
				.tertiary(6000, 'Baby kalphite king')
				.tertiary(2500, 'Perfect chitlin')
				.tertiary(
					100,
					new LootTable()
						.add('Drygore rapier')
						.add('Drygore longsword')
						.add('Drygore mace')
						.add('Offhand drygore rapier')
						.add('Offhand drygore longsword')
						.add('Offhand drygore mace')
				)
				.add(GrimyHerbTable)
				.add(SeedTable)
				.add('Super restore(4)', [1, 5])
				.add('Coins', [100_000, 2_000_000])
		)
	},
	emoji: '',
	wildy: false,
	canBeKilled: false,
	difficultyRating: 10,
	qpRequired: 0,
	groupKillable: true,
	respawnTime: Time.Second * 10,
	levelRequirements: {
		prayer: 95,
		attack: 90,
		strength: 90,
		defence: 90
	},
	healAmountNeeded: 120 * 20,
	attackStyleToUse: GearSetupTypes.Melee,
	attackStylesUsed: [GearStat.AttackCrush],
	minimumGearRequirements: {
		[GearSetupTypes.Melee]: {
			[GearStat.AttackCrush]: 8 + 12 + 12 + 6 + 16 + 95
		}
	}
};
