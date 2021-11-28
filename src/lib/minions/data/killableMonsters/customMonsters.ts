import { Time } from 'e';
import { Bank, LootTable, Monsters } from 'oldschooljs';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import Monster from 'oldschooljs/dist/structures/Monster';

import { GearStat } from '../../../gear';
import { runeWeaponTable } from '../../../simulation/sharedTables';
import { itemID } from '../../../util';
import resolveItems from '../../../util/resolveItems';
import { KillableMonster } from '../../types';
import { GrimyHerbTable } from './custom/Treebeard';

interface CustomMonster extends Omit<KillableMonster, 'table'> {
	table: LootTable;
	baseMonster: Monster;
}

export const customMonsters: CustomMonster[] = [
	{
		id: 345_232,
		baseMonster: Monsters.LavaDragon,
		name: 'Frost Dragon',
		aliases: ['frost dragon', 'fd'],
		timeToFinish: Time.Minute * 6,
		table: new LootTable()
			.every('Frost dragon bones')
			.tertiary(10_000, 'Draconic visage')
			.tertiary(110, 'Clue scroll (grandmaster)')
			.tertiary(33, RareDropTable)
			.add('Rune arrow', [12, 36])
			.add('Water talisman')
			.add('Adamant platelegs', [2, 5])
			.add('Adamant platebody', [2, 5])
			.add(runeWeaponTable, [2, 5])
			.add('Death rune', [10, 15])
			.add('Law rune', [10, 15])
			.add('Pure essence', 50)
			.add(GrimyHerbTable)
			.add('Coins', [200, 1337])
			.add('Water orb')
			.add('Limpwurt root', [3, 5])
			.add('Mahogany logs', [3, 5])
			.add('Adamantite stone spirit', 3),
		wildy: false,
		notifyDrops: resolveItems([]),
		difficultyRating: 5,
		itemsRequired: resolveItems([]),
		qpRequired: 60,
		healAmountNeeded: 20 * 14,
		attackStyleToUse: GearStat.AttackStab,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
		levelRequirements: {
			dungeoneering: 85,
			prayer: 70
		},
		itemInBankBoosts: [
			{
				[itemID('TzKal cape')]: 8,
				[itemID('Infernal cape')]: 4,
				[itemID('Fire cape')]: 2
			}
		],
		itemCost: {
			itemCost: new Bank().add('Prayer potion(4)', 1),
			qtyPerKill: 0.2
		},
		pohBoosts: {
			pool: {
				'Rejuvenation pool': 3,
				'Fancy rejuvenation pool': 3,
				'Ornate rejuvenation pool': 3,
				'Ancient rejuvenation pool': 5
			}
		}
	}
];
