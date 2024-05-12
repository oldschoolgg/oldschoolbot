import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { MysteryBoxes } from '../../../../../bsoOpenables';
import { HighSeedPackTable } from '../../../../../data/seedPackTables';
import { GearStat } from '../../../../../gear';
import { addStatsOfItemsTogether } from '../../../../../structures/Gear';
import itemID from '../../../../../util/itemID';
import resolveItems from '../../../../../util/resolveItems';
import { CustomMonster } from '../customMonsters';

// Regular loot similar to clue loot, since it costs clues to kill, and is clue-themed
export const EnigmarLootTable = new LootTable()
	.every(
		new LootTable()
			.add('Wrath rune', [200, 250])
			.add('Soul rune', [150, 250])
			.add('Blood rune', [200, 300], 2)
			.add('Nature rune', [100, 300], 2)
			.add('Death rune', [100, 300], 2)

			.add(HighSeedPackTable.clone().add('Korulsi seed', 1, 4), [2, 3])

			.add('Dragon scimitar')
			.add('Dragon dagger')
			.add('Dragon battleaxe')

			.add(
				new LootTable()
					.add('Mahogany plank', [55, 111])
					.add('Teak plank', [66, 121])
					.add('Oak plank', [77, 143]),
				1,
				2
			),
		3
	)
	.tertiary(15, MysteryBoxes)
	.tertiary(100, 'Elder scroll piece')
	.tertiary(200, 'Enigmatic orb')
	.tertiary(10, 'Enigma tokens', [1, 3])
	.tertiary(1000, "Mini 'mar");

export const Enigmar: CustomMonster = {
	id: 93_184,
	baseMonster: Monsters.KrilTsutsaroth,
	name: 'Enigmar',
	aliases: ['enigmar', 'enigma'],
	timeToFinish: Time.Minute * 25,
	hp: 4200,
	table: EnigmarLootTable,
	difficultyRating: 5,
	qpRequired: 1000,
	healAmountNeeded: 200 * 12,
	attackStyleToUse: GearStat.AttackMagic,
	attackStylesUsed: [GearStat.AttackMagic],
	levelRequirements: {
		hitpoints: 110,
		attack: 110,
		strength: 110,
		defence: 110,
		prayer: 110
	},
	pohBoosts: {
		pool: {
			'Ornate rejuvenation pool': 5,
			'Ancient rejuvenation pool': 10
		}
	},
	deathProps: {
		hardness: 0.5,
		steepness: 0.999,
		lowestDeathChance: 5,
		highestDeathChance: 65
	},
	minimumFoodHealAmount: 22,
	allItems: [],
	minimumGearRequirements: {
		melee: {}
	},
	minimumWeaponShieldStats: {
		mage: addStatsOfItemsTogether(resolveItems(['Master wand', 'Arcane spirit shield']), [GearStat.AttackMagic])
	},
	itemCost: {
		itemCost: new Bank().add('Enigma tokens', 1).add('Super restore(4)', 1).freeze(),
		qtyPerKill: 1,
		alternativeConsumables: [
			{
				itemCost: new Bank().add('Enigma tokens', 1).add('Prayer potion(4)', 2).freeze(),
				qtyPerKill: 1
			}
		]
	},
	tameCantKill: true,
	itemsRequired: resolveItems([]),
	setupsUsed: ['mage'],
	equippedItemBoosts: [
		{
			gearSetup: 'mage',
			items: [
				{ boostPercent: 20, itemID: itemID('Void staff') },
				{ boostPercent: 12, itemID: itemID('Void staff (u)') },
				{ boostPercent: 10, itemID: itemID('Virtus wand') }
			]
		},
		{
			gearSetup: 'mage',
			items: [
				{ boostPercent: 8, itemID: itemID('Abyssal tome') },
				{ boostPercent: 4, itemID: itemID('Virtus book') }
			]
		},
		{
			gearSetup: 'mage',
			items: [
				{ boostPercent: 6, itemID: itemID('Spellbound ring(i)') },
				{ boostPercent: 3, itemID: itemID('Spellbound ring(i)') }
			]
		}
	]
};
