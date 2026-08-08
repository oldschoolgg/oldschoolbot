import {Bank, itemID, LootTable, Monsters, resolveItems} from "oldschooljs/src/index.js";
import {HighSeedPackTable} from "@/lib/data/seedPackTables.js";
import {CustomMonster} from "@/lib/bso/monsters/CustomMonster.js";
import {Time} from "@sapphire/time-utilities";
import { GearStat } from '@oldschoolgg/gear';
import {addStatsOfItemsTogether} from "@/lib/structures/Gear.js";


const boxTable = new LootTable()
	.add('Pet mystery box')
	.add('Holiday mystery box')
	.add('Equippable mystery box')
	.add('Clothing mystery box')
	.add('Tradeable mystery box', 2)
	.add('Untradeable mystery box', 2);

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
	.tertiary(15, boxTable)
	.tertiary(100, 'Elder scroll piece')
	.tertiary(200, 'Enigmatic orb')
	.tertiary(10, 'Enigma tokens', [1, 3])
	.tertiary(1000, "Mini 'mar");

export const Enigmar: CustomMonster = {
	id: 93_184,
	baseMonster: Monsters.KrilTsutsaroth,
	name: 'Enigmar',
	isCustom: true,
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
	minimumHealAmount: 22,
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
				{ boostPercent: 3, itemID: itemID('Spellbound ring') }
			]
		}
	]
};
