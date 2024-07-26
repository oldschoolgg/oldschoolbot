import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import HerbDropTable from 'oldschooljs/dist/simulation/subtables/HerbDropTable';
import { GemTable } from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import UncommonSeedDropTable from 'oldschooljs/dist/simulation/subtables/UncommonSeedDropTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { YETI_ID } from '../../../../constants';
import { GearStat } from '../../../../gear';
import type { CustomMonster } from './customMonsters';

const DeadTable = new LootTable().add('Iron med helm').add('Bones').add('Skull').add('Bronze sword');

export const YetiLootTable = new LootTable()
	.every('Raw yeti meat', [1, 2])
	.every('Yeti hide', [2, 3])
	.tertiary(100, 'Frostclaw cape')
	.tertiary(100, 'Cold heart')
	.tertiary(900, 'Penguin egg')
	.tertiary(20, DeadTable)

	.add('Gold bracelet', [100, 200])

	/* Weapons and armour */
	.add('Rune full helm', [1, 10], 10)
	.add('Rune platebody', [1, 10], 10)
	.add('Rune warhammer', [1, 10], 5)
	.add('Rune axe', [1, 10], 5)
	.add('Rune kiteshield', [1, 10], 2)
	.add('Granite shield', [1, 10], 1)
	.add('Rune warhammer', [1, 10], 1)

	/* Runes */
	.add('Earth rune', [120, 360], 10)
	.add('Nature rune', [400, 1200], 5)
	.add('Law rune', [400, 800], 5)

	/* Herbs */
	.add(HerbDropTable, [4, 5], 2)
	.add(UncommonSeedDropTable, [4, 5], 11)

	/* Other */
	.add('Coins', [10_000, 100_000], 20)
	.add('Raw shark', [55, 280], 10)
	.add('Seaweed', [130, 190], 10)
	.add('Ball of wool', [22, 92], 10)

	/* Gem drop table */
	.add(GemTable, [3, 10], 1)

	/* Tertiary */
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export const Yeti: CustomMonster = {
	id: YETI_ID,
	name: 'Yeti',
	aliases: ['yeti'],
	timeToFinish: Time.Minute * 30,
	table: YetiLootTable,
	healAmountNeeded: 20 * 800,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab],
	groupKillable: false,
	respawnTime: Time.Minute * 4,
	baseMonster: Monsters.BlackDemon,
	hp: 960,
	deathProps: {
		lowestDeathChance: 10,
		highestDeathChance: 30,
		steepness: 0.99,
		hardness: 0.4
	}
};
