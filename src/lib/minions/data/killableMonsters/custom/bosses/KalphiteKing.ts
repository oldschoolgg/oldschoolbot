import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { kalphiteKingCL } from '../../../../../data/CollectionsExport';
import { GearStat } from '../../../../../gear';
import { SeedTable } from '../../../../../simulation/seedTable';
import setCustomMonster, { makeKillTable } from '../../../../../util/setCustomMonster';
import type { KillableMonster } from '../../../../types';
import { GrimyHerbTable } from '../Treebeard';

export const kalphiteKingLootTable = new LootTable()
	.tertiary(18, 'Clue scroll (grandmaster)')
	.tertiary(3000, 'Baby kalphite king')
	.tertiary(2500, 'Perfect chitin')
	.tertiary(
		150,
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
	.add('Coins', [100_000, 2_000_000]);

export const KalphiteKingMonster: KillableMonster = {
	id: 23_483,
	name: 'Kalphite King',
	aliases: ['kk'],
	timeToFinish: Time.Minute * 25,
	notifyDrops: kalphiteKingCL,
	table: makeKillTable(kalphiteKingLootTable),
	emoji: '',
	wildy: false,
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
	attackStyleToUse: GearStat.AttackCrush,
	attackStylesUsed: [GearStat.AttackCrush],
	minimumGearRequirements: {
		melee: {
			[GearStat.AttackCrush]: 8 + 12 + 12 + 6 + 16 + 95
		}
	}
};

setCustomMonster(KalphiteKingMonster.id, 'Kalphite King', kalphiteKingLootTable, Monsters.GeneralGraardor, {
	id: KalphiteKingMonster.id,
	name: 'Kalphite King',
	aliases: ['kk', 'kalphite king']
});
