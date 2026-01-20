import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { GearStat } from '@oldschoolgg/gear';
import { Time } from '@oldschoolgg/toolkit';
import { itemID, LootTable, Monsters, RareSeedTable, resolveItems } from 'oldschooljs';

const clueTable = new LootTable()
	.add('Clue scroll (master)', [1, 3], 1)
	.add('Clue scroll (master)', 1, 2)
	.add('Clue scroll (elite)', [1, 4], 2)
	.add('Clue scroll (elite)', 1, 4)
	.add('Clue scroll (medium)', [1, 5], 4)
	.add('Clue scroll (medium)', 1, 8);

const rawFoodTable = new LootTable().add('Raw tuna', [25, 75], 3).add('Raw swordfish', [20, 60], 2);

const regularTable = new LootTable({ limit: 41 })
	/* Supplies */
	.add('Dragon bolts (unf)', [20, 30], 2)
	.add('Cadantine seed', [1, 3], 2)
	.add('Toadflax seed', [1, 3], 2)
	.add('Lantadyme seed', [1, 3], 2)
	.add('Bow string', [100, 250], 2)
	.add('Ruby bolt tips', [15, 75])
	.add('Dragonstone bolt tips', [10, 50])
	.add('Dragon bones', [5, 10])
	.add('Soul rune', [200, 400])
	.add('Blood rune', [200, 400])
	.add('Death rune', [200, 500])
	.add('Amethyst', [50, 100])
	.add('Uncut dragonstone', [10, 20])
	.add('Mithril ore', [250, 350])
	.add('Adamantite ore', [100, 200])
	.add('Runite ore', [10, 50])

	/* Food */
	.add(rawFoodTable, 1, 10)

	/* Other */
	.add('Coins', [50_000, 200_000])
	.add('Pure essence', [1500, 2500], 2)
	.oneIn(1000, 'Ancient staff')

	/* Sub Tables */
	.add(RareSeedTable, 2, 3, { multiply: true });

export const NihilizLootTable = new LootTable()
	.every(regularTable, 3)

	/* Tertiary */
	.tertiary(6, rawFoodTable)
	.tertiary(12, clueTable)
	.tertiary(10, 'Nihil shard', [5, 20])
	.tertiary(2000, 'Nihil horn')
	.tertiary(1200, 'Zaryte vambraces')
	.tertiary(150, 'Clue scroll (grandmaster)')
	.tertiary(5000, 'Nexling');

export const Nihiliz: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.NIHILIZ,
	name: 'Nihiliz',
	aliases: ['nihiliz', 'shadow nihil boss', 'mini nex', 'nihilist'],
	timeToFinish: Time.Minute * 16,
	table: NihilizLootTable,
	emoji: '',
	wildy: false,
	difficultyRating: 9,
	qpRequired: 1000,
	healAmountNeeded: 20 * 32,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab, GearStat.AttackSlash, GearStat.AttackMagic, GearStat.AttackRanged],
	minimumGearRequirements: {
		melee: {
			[GearStat.AttackStab]: 100,
			[GearStat.DefenceStab]: 150,
			[GearStat.DefenceSlash]: 150,
			[GearStat.DefenceMagic]: -20,
			[GearStat.DefenceRanged]: 150
		}
	},
	itemInBankBoosts: [
		{
			[itemID('Zaryte crossbow')]: 15,
			[itemID('Zaryte bow')]: 10
		},
		{
			[itemID('Drygore rapier')]: 15
		},
		{
			[itemID('Offhand spidergore rapier')]: 14,
			[itemID('Offhand drygore rapier')]: 10
		},
		{
			[itemID('Dragon warhammer')]: 5
		},
		{
			[itemID('Zaryte vambraces')]: 5
		}
	],
	groupKillable: false,
	hp: 800,
	respawnTime: Time.Second * 10,
	levelRequirements: {
		prayer: 95,
		attack: 99,
		strength: 105,
		magic: 105,
		defence: 99
	},
	pohBoosts: {
		pool: {
			'Fancy rejuvenation pool': 5,
			'Ornate rejuvenation pool': 10,
			'Ancient rejuvenation pool': 15
		}
	},
	uniques: resolveItems(['Nihil horn', 'Zaryte vambraces', 'Nihil shard', 'Nexling']),
	notifyDrops: resolveItems(['Nihil horn', 'Zaryte vambraces', 'Nexling']),
	baseMonster: Monsters.Hespori
};
