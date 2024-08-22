import { Time, roll, shuffleArr, uniqueArr } from 'e';
import { Bank, LootTable, Monsters } from 'oldschooljs';

import { vladDrakanCL } from '../../../../data/CollectionsExport';
import { globalDroprates } from '../../../../data/globalDroprates';
import { GearStat } from '../../../../gear';
import { runeWeaponTable } from '../../../../simulation/sharedTables';
import { clAdjustedDroprate, randomVariation, resolveNameBank } from '../../../../util';
import resolveItems from '../../../../util/resolveItems';
import type { CustomMonster } from './customMonsters';

const JewelleryTable = new LootTable()
	.add(new LootTable().add('Onyx ring').add('Onyx necklace').add('Onyx bracelet').add('Onyx amulet'))
	.add(
		new LootTable()
			.add('Dragonstone ring')
			.add('Dragon necklace')
			.add('Dragonstone bracelet')
			.add('Dragonstone amulet'),
		1,
		2
	)
	.add(
		new LootTable().add('Diamond ring').add('Diamond necklace').add('Diamond bracelet').add('Diamond amulet'),
		1,
		2
	)
	.add(
		new LootTable().add('Emerald ring').add('Emerald necklace').add('Emerald bracelet').add('Emerald amulet'),
		1,
		2
	)
	.add(
		new LootTable().add('Sapphire ring').add('Sapphire necklace').add('Sapphire bracelet').add('Sapphire amulet'),
		1,
		2
	)
	.add(new LootTable().add('Gold ring').add('Gold necklace').add('Gold bracelet').add('Gold amulet'));

const table = new LootTable()
	.every('Vampyre dust')
	.tertiary(512, 'Blightbrand')
	.tertiary(50, 'Clue scroll (elite)')
	.tertiary(100, 'Clue scroll (master)')
	.tertiary(256, 'Clue scroll (grandmaster)')
	.add('Blood orange seed', [5, 10])
	.add(new LootTable().add('Rune arrow').add('Adamant platebody'), [10, 15])
	.add(runeWeaponTable, [2, 5])
	.add('Coins', [100_000, 300_000])
	.add(JewelleryTable, [4, 6])
	.add('Crystal key', [3, 5])
	.add('Dragon bones', [30, 50])
	.add('Adamantite stone spirit', 3);

export const VladimirDrakan: CustomMonster = {
	id: 291_242,
	baseMonster: Monsters.AbyssalSire,
	name: 'Vladimir Drakan',
	aliases: ['vladimir drakan', 'vd'],
	timeToFinish: Time.Minute * 15,
	hp: 330,
	table,
	difficultyRating: 5,
	qpRequired: 160,
	healAmountNeeded: 20 * 25,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackRanged],
	levelRequirements: {
		hitpoints: 120
	},
	itemInBankBoosts: [
		resolveNameBank({
			'Axe of the high sungod': 10
		})
	],
	itemCost: {
		itemCost: new Bank().add('Vial of blood', 1).add('Silver stake', 1),
		qtyPerKill: 1
	},
	specialLoot: async ({ loot, cl, quantity }) => {
		for (let i = 0; i < quantity; i++) {
			const droprate = clAdjustedDroprate(
				cl,
				'Echo',
				globalDroprates.echo.baseRate,
				globalDroprates.echo.clIncrease
			);
			if (roll(droprate)) {
				loot.add('Echo');
			}

			const plushieDroprate = clAdjustedDroprate(cl, 'Vampyric plushie', 250, 2);
			if (roll(plushieDroprate)) {
				loot.add('Vampyric plushie');
			}

			const outfit = resolveItems([
				'Vampyre hunter boots',
				'Vampyre hunter legs',
				'Vampyre hunter top',
				'Vampyre hunter cuffs',
				'Vampyre hunter hat'
			]);
			const unownedPiece = shuffleArr(outfit).find(i => !cl.has(i));
			if (unownedPiece && roll(32)) {
				loot.add(unownedPiece);
			}
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
		calculateQuantity: (opts: { quantity: number }) => Math.ceil(randomVariation(opts.quantity * 50, 5)),
		requiredAmmo: resolveItems(['Silver bolts'])
	},
	allItems: uniqueArr([...table.allItems, ...vladDrakanCL])
};
