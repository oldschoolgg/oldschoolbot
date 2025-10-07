import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';
import { BattlestaffTable, runeAlchablesTable, StoneSpiritTable } from '@/lib/bso/tables/sharedTables.js';

import { Time } from '@oldschoolgg/toolkit';
import { GemTable, LootTable, Monsters, resolveItems } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

import { LowSeedPackTable } from '@/lib/data/seedPackTables.js';

export const CockroachSoldier: CustomMonster = {
	isCustom: true,
	id: 31_621,
	name: 'Cockroach soldier',
	aliases: ['cockroach soldier', 'cs'],
	timeToFinish: Time.Minute,
	table: new LootTable({ limit: 32 })
		.add('Leather')
		.add('Rune platebody')
		.add('Coins', [100, 200], 3)
		.add(LowSeedPackTable)
		.add(GemTable)
		.add(StoneSpiritTable)
		.every('Carapace'),
	healAmountNeeded: 50,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackCrush],
	groupKillable: false,
	respawnTime: Time.Second * 5,
	baseMonster: Monsters.BlackDemon,
	hp: 60
};

export const EliteBlackKnight: CustomMonster = {
	isCustom: true,
	id: 31_651,
	name: 'Elite Black Knight',
	aliases: ['ebk', 'elite black knight'],
	timeToFinish: Time.Minute * 4,
	table: new LootTable({ limit: 32 })
		.every('Bones')
		.tertiary(64, 'Zamorakian codex')
		.tertiary(
			6,
			new LootTable()
				.add('Elite black knight sword')
				.add('Elite black knight kiteshield')
				.add('Elite black knight helm')
				.add('Elite black knight platebody')
				.add('Elite black knight platelegs')
		)
		.add(runeAlchablesTable)
		.add('Coins', [10_000, 20_000])
		.add(BattlestaffTable)
		.add(GemTable)
		.add(StoneSpiritTable),
	healAmountNeeded: 220,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab],
	groupKillable: false,
	respawnTime: Time.Second * 8,
	baseMonster: Monsters.BlackDemon,
	hp: 560,
	itemsRequired: resolveItems(['Dark Temple key'])
};
