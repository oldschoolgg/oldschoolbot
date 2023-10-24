import { roll, shuffleArr, Time } from 'e';
import { Bank, LootTable, Monsters } from 'oldschooljs';

import { globalDroprates } from '../../../../data/globalDroprates';
import { GearStat } from '../../../../gear';
import { GrimyHerbTable, runeWeaponTable } from '../../../../simulation/sharedTables';
import { clAdjustedDroprate, randomVariation } from '../../../../util';
import resolveItems from '../../../../util/resolveItems';
import { CustomMonster } from './customMonsters';

export const VladimirDrakan: CustomMonster = {
	id: 291_242,
	baseMonster: Monsters.AbyssalSire,
	name: 'Vladimir Drakan',
	aliases: ['vladimir drakan', 'vd'],
	timeToFinish: Time.Minute * 15,
	hp: 330,
	table: new LootTable()
		.every('Vampyre dust')
		.tertiary(512, 'Blightbrand')
		.tertiary(256, 'Vampyric plushie')
		.tertiary(50, 'Clue scroll (elite)')
		.tertiary(100, 'Clue scroll (master)')
		.tertiary(256, 'Clue scroll (grandmaster)')
		.add('Blood orange seed', [5, 10])
		.add(new LootTable().add('Rune arrow').add('Adamant platebody'), [10, 15])
		.add(runeWeaponTable, [2, 5])
		.add('Pure essence', 50)
		.add(GrimyHerbTable, 5)
		.add('Coins', [100_000, 300_000])
		.add('Uncut dragonstone', [3, 5])
		.add('Crystal key', [3, 5])
		.add('Dragon bones', [30, 50])
		.add('Adamantite stone spirit', 3),
	difficultyRating: 5,
	qpRequired: 160,
	healAmountNeeded: 20 * 14,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		hitpoints: 120
	},
	itemInBankBoosts: [],
	itemCost: {
		itemCost: new Bank().add('Vial of blood', 1).add('Silver stake', 1),
		qtyPerKill: 1
	},
	specialLoot: async (loot, user) => {
		const droprate = clAdjustedDroprate(
			user,
			'Echo',
			globalDroprates.echo.baseRate,
			globalDroprates.echo.clIncrease
		);
		if (roll(droprate)) {
			loot.add('Echo');
		}
		const outfit = shuffleArr(
			resolveItems([
				'Vampyre hunter boots',
				'Vampyre hunter legs',
				'Vampyre hunter top',
				'Vampyre hunter cuffs',
				'Vampyre hunter hat'
			])
		);
		const unownedPiece = shuffleArr(outfit).find(i => !user.cl.has(i)) ?? outfit[0];
		if (roll(32)) {
			loot.add(unownedPiece);
		}
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.5,
		steepness: 0.5,
		lowestDeathChance: 0.01,
		highestDeathChance: 70
	},
	projectileUsage: {
		required: true,
		calculateQuantity: (opts: { quantity: number }) => Math.ceil(randomVariation(opts.quantity * 50, 5))
	}
};
