import { Time } from '@oldschoolgg/toolkit';
import { LootTable, Monsters, resolveItems } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

import { kalphiteKingCL } from '@/lib/data/CollectionsExport.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import { SeedTable } from '@/lib/simulation/seedTable.js';
import { GrimyHerbTable } from '@/lib/simulation/sharedTables.js';
import { decideLoot } from '@/lib/util/LootDecider.js';
import setCustomMonster, { makeKillTable } from '@/lib/util/setCustomMonster.js';

export const kalphiteKingLootTable = new LootTable()
	.tertiary(18, 'Clue scroll (grandmaster)')
	.tertiary(3000, 'Baby kalphite king')
	.tertiary(1250, 'Perfect chitin')
	.add(GrimyHerbTable)
	.add(SeedTable)
	.add('Super restore(4)', [1, 5])
	.add('Coins', [100_000, 2_000_000]);

export const drygoreWeapons = resolveItems([
	'Drygore rapier',
	'Drygore longsword',
	'Drygore mace',
	'Offhand drygore rapier',
	'Offhand drygore longsword',
	'Offhand drygore mace'
]);

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
	},
	specialLoot: ({ loot, cl, quantity }) => {
		loot.add(
			decideLoot({
				tables: [
					{
						type: 'DropsLeastOwnedFirst',
						drops: drygoreWeapons,
						chance: 150
					}
				],
				collectionLog: cl,
				quantity
			})
		);
	}
};

setCustomMonster(KalphiteKingMonster.id, 'Kalphite King', kalphiteKingLootTable, Monsters.GeneralGraardor, {
	id: KalphiteKingMonster.id,
	name: 'Kalphite King',
	aliases: ['kk', 'kalphite king']
});
