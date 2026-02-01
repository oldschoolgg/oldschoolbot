import { kalphiteKingCL } from '@/lib/bso/collection-log/main.js';
import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { makeKillTable, setCustomMonster } from '@/lib/bso/monsters/setCustomMonster.js';
import { decideLoot } from '@/lib/bso/structures/LootDecider.js';
import { SeedTable } from '@/lib/bso/tables/seedTable.js';
import { GrimyHerbTable } from '@/lib/bso/tables/sharedTables.js';

import { GearStat } from '@oldschoolgg/gear';
import { Time } from '@oldschoolgg/toolkit';
import { LootTable, Monsters, resolveItems } from 'oldschooljs';

import type { KillableMonster } from '@/lib/minions/types.js';

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

setCustomMonster(EBSOMonster.KALPHITE_KING, 'Kalphite King', kalphiteKingLootTable, Monsters.GeneralGraardor, {
	id: EBSOMonster.KALPHITE_KING,
	name: 'Kalphite King',
	aliases: ['kk', 'kalphite king']
});
