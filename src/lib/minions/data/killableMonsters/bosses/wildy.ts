import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { WildernessDiary } from '../../../../diaries';
import { GearStat } from '../../../../gear/types';
import { SkillsEnum } from '../../../../skilling/types';
import itemID from '../../../../util/itemID';
import { deepResolveItems } from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';

export const wildyKillableMonsters: KillableMonster[] = [
	{
		id: Monsters.Callisto.id,
		name: Monsters.Callisto.name,
		aliases: Monsters.Callisto.aliases,
		table: Monsters.Callisto,
		timeToFinish: Time.Minute * 7,
		emoji: '<:Callisto_cub:324127376273440768>',
		wildy: true,
		wildyMulti: true,
		canBePked: true,
		pkActivityRating: 9,
		pkBaseDeathChance: 10,

		// Check respawn time
		groupKillable: true,
		respawnTime: Time.Minute * 0.29,

		itemCost: {
			itemCost: new Bank().add('Blighted ancient ice sack', 1),
			qtyPerMinute: 3,
			alternativeConsumables: [
				{
					itemCost: new Bank().add('Blood rune', 2).add('Death rune', 4).add('Water rune', 6),
					qtyPerMinute: 3
				},
				{ itemCost: new Bank().add('Stamina potion(4)', 1), qtyPerMinute: 0.125 }
			]
		},

		difficultyRating: 7,
		qpRequired: 0,
		equippedItemBoosts: [
			{
				items: [
					{ boostPercent: 2.5, itemID: itemID('Masori mask (f)') },
					{ boostPercent: 2.5, itemID: itemID('Masori mask') },
					{ boostPercent: 1, itemID: itemID('Armadyl helmet') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3, itemID: itemID('Necklace of anguish') },
					{ boostPercent: 1, itemID: itemID('Amulet of fury') },
					{ boostPercent: 0.5, itemID: itemID('Amulet of glory') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 2, itemID: itemID("Ava's assembler") },
					{ boostPercent: 0.5, itemID: itemID("Ava's accumulator") }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3.5, itemID: itemID('Masori body (f)') },
					{ boostPercent: 3.5, itemID: itemID('Masori body') },
					{ boostPercent: 0.5, itemID: itemID('Armadyl chestplate') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3.5, itemID: itemID('Masori chaps (f)') },
					{ boostPercent: 3.5, itemID: itemID('Masori chaps') },
					{ boostPercent: 1, itemID: itemID('Armadyl chainskirt') },
					{ boostPercent: 0.5, itemID: itemID("Black d'hide chaps") }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 28, itemID: itemID('Webweaver bow') },
					{ boostPercent: 25, itemID: itemID("Craw's bow") },
					{ boostPercent: 6, itemID: itemID('Zaryte crossbow') },
					{ boostPercent: 1, itemID: itemID('Armadyl crossbow') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3, itemID: itemID('Zaryte vambraces') },
					{ boostPercent: 0.5, itemID: itemID('Barrows gloves') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 1.5, itemID: itemID('Pegasian boots') },
					{ boostPercent: 1, itemID: itemID('Ranger boots') },
					{ boostPercent: 0.5, itemID: itemID("Guthix d'hide boots") }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3, itemID: itemID('Venator ring') },
					{ boostPercent: 1, itemID: itemID('Archers ring (i)') },
					{ boostPercent: 0.5, itemID: itemID('Brimstone ring') }
				],
				gearSetup: 'wildy'
			}
		],
		minimumGearRequirements: {
			wildy: {
				[GearStat.AttackRanged]: 150,
				[GearStat.DefenceCrush]: 84,
				[GearStat.DefenceMagic]: 83
			}
		},
		levelRequirements: {
			prayer: 44,
			hitpoints: 60,
			defence: 60,
			ranged: 65,
			magic: 70
		},
		defaultAttackStyles: [SkillsEnum.Ranged],
		combatXpMultiplier: 1.225,
		healAmountNeeded: 13 * 20,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Artio.id,
		name: Monsters.Artio.name,
		aliases: Monsters.Artio.aliases,
		table: Monsters.Artio,
		timeToFinish: Time.Minute * 3.2,
		emoji: '<:Callisto_cub:324127376273440768>',
		wildy: true,
		wildyMulti: false,
		canBePked: true,
		pkActivityRating: 10,
		pkBaseDeathChance: 10,

		itemCost: {
			itemCost: new Bank().add('Blighted ancient ice sack', 1),
			qtyPerMinute: 2.5,
			alternativeConsumables: [
				{
					itemCost: new Bank().add('Blood rune', 2).add('Death rune', 4).add('Water rune', 6),
					qtyPerMinute: 2.5
				},
				{ itemCost: new Bank().add('Stamina potion(4)', 1), qtyPerMinute: 0.125 }
			]
		},

		difficultyRating: 2,
		qpRequired: 0,
		equippedItemBoosts: [
			{
				items: [
					{ boostPercent: 2.5, itemID: itemID('Masori mask (f)') },
					{ boostPercent: 2.5, itemID: itemID('Masori mask') },
					{ boostPercent: 1, itemID: itemID('Armadyl helmet') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3, itemID: itemID('Necklace of anguish') },
					{ boostPercent: 1, itemID: itemID('Amulet of fury') },
					{ boostPercent: 0.5, itemID: itemID('Amulet of glory') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 2, itemID: itemID("Ava's assembler") },
					{ boostPercent: 0.5, itemID: itemID("Ava's accumulator") }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3.5, itemID: itemID('Masori body (f)') },
					{ boostPercent: 3.5, itemID: itemID('Masori body') },
					{ boostPercent: 0.5, itemID: itemID('Armadyl chestplate') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3.5, itemID: itemID('Masori chaps (f)') },
					{ boostPercent: 3.5, itemID: itemID('Masori chaps') },
					{ boostPercent: 1, itemID: itemID('Armadyl chainskirt') },
					{ boostPercent: 0.5, itemID: itemID("Black d'hide chaps") }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 28, itemID: itemID('Webweaver bow') },
					{ boostPercent: 25, itemID: itemID("Craw's bow") },
					{ boostPercent: 6, itemID: itemID('Zaryte crossbow') },
					{ boostPercent: 1, itemID: itemID('Armadyl crossbow') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3, itemID: itemID('Zaryte vambraces') },
					{ boostPercent: 0.5, itemID: itemID('Barrows gloves') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 1.5, itemID: itemID('Pegasian boots') },
					{ boostPercent: 1, itemID: itemID('Ranger boots') },
					{ boostPercent: 0.5, itemID: itemID("Guthix d'hide boots") }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 3, itemID: itemID('Venator ring') },
					{ boostPercent: 1, itemID: itemID('Archers ring (i)') },
					{ boostPercent: 0.5, itemID: itemID('Brimstone ring') }
				],
				gearSetup: 'wildy'
			}
		],
		minimumGearRequirements: {
			wildy: {
				[GearStat.AttackRanged]: 150,
				[GearStat.DefenceCrush]: 84,
				[GearStat.DefenceMagic]: 83
			}
		},
		levelRequirements: {
			prayer: 44,
			hitpoints: 60,
			defence: 60,
			ranged: 65,
			magic: 70
		},
		diaryRequirement: [WildernessDiary, WildernessDiary.medium],
		defaultAttackStyles: [SkillsEnum.Ranged],
		healAmountNeeded: 8 * 20,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackCrush]
	},
	{
		id: Monsters.Vetion.id,
		name: Monsters.Vetion.name,
		aliases: Monsters.Vetion.aliases,
		table: Monsters.Vetion,
		timeToFinish: Time.Minute * 11.95,
		emoji: '<:Vetion_jr:324127378999738369>',
		wildy: true,
		wildyMulti: true,
		canBePked: true,
		pkActivityRating: 9,
		pkBaseDeathChance: 9,

		// Check respawn time
		groupKillable: true,
		respawnTime: Time.Minute * 0.33,

		difficultyRating: 7,
		qpRequired: 0,
		equippedItemBoosts: [
			{
				items: [
					{ boostPercent: 4, itemID: itemID("Inquisitor's great helm") },
					{ boostPercent: 2, itemID: itemID('Torva full helm') },
					{ boostPercent: 1.5, itemID: itemID('Neitiznot faceguard') },
					{ boostPercent: 1, itemID: itemID('Helm of neitiznot') },
					{ boostPercent: 0.5, itemID: itemID('Berserker helm') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Infernal cape') },
					{ boostPercent: 6, itemID: itemID('Mythical cape') },
					{ boostPercent: 3, itemID: itemID('Fire cape') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 9, itemID: itemID("Inquisitor's hauberk") },
					{ boostPercent: 6, itemID: itemID('Torva platebody') },
					{ boostPercent: 3, itemID: itemID('Bandos chestplate') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 9, itemID: itemID("Inquisitor's plateskirt") },
					{ boostPercent: 6, itemID: itemID('Torva platelegs') },
					{ boostPercent: 3, itemID: itemID('Bandos tassets') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 49.5, itemID: itemID('Ursine chainmace') },
					{ boostPercent: 46, itemID: itemID("Viggora's chainmace") },
					{ boostPercent: 21.5, itemID: itemID("Inquisitor's mace") },
					{ boostPercent: 21, itemID: itemID('Abyssal bludgeon') },
					{ boostPercent: 2.5, itemID: itemID('Zamorakian hasta') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 16.5, itemID: itemID('Avernic defender') },
					{ boostPercent: 12.5, itemID: itemID('Dragon defender') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 9, itemID: itemID('Ferocious gloves') },
					{ boostPercent: 5, itemID: itemID('Barrows gloves') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 4, itemID: itemID('Primordial boots') },
					{ boostPercent: 2.5, itemID: itemID('Dragon boots') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Ultor ring') },
					{ boostPercent: 5.5, itemID: itemID('Berserker ring (i)') },
					{ boostPercent: 5, itemID: itemID('Brimstone ring') }
				],
				gearSetup: 'wildy'
			}
		],
		minimumGearRequirements: {
			wildy: {
				[GearStat.AttackCrush]: 73,
				[GearStat.MeleeStrength]: 80,
				[GearStat.DefenceSlash]: 110,
				[GearStat.DefenceMagic]: 30
			}
		},
		levelRequirements: {
			attack: 75,
			strength: 75,
			prayer: 44,
			hitpoints: 70,
			defence: 70,
			magic: 70
		},
		defaultAttackStyles: [SkillsEnum.Attack],
		customMonsterHP: 630,
		combatXpMultiplier: 1.225,
		healAmountNeeded: 13 * 20,
		attackStyleToUse: GearStat.AttackCrush,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Calvarion.id,
		name: Monsters.Calvarion.name,
		aliases: Monsters.Calvarion.aliases,
		table: Monsters.Calvarion,
		timeToFinish: Time.Minute * 7.17,
		emoji: '<:Vetion_jr:324127378999738369>',
		wildy: true,
		wildyMulti: false,
		canBePked: true,
		pkActivityRating: 10,
		pkBaseDeathChance: 9,

		difficultyRating: 2,
		qpRequired: 0,
		equippedItemBoosts: [
			{
				items: [
					{ boostPercent: 4, itemID: itemID("Inquisitor's great helm") },
					{ boostPercent: 2, itemID: itemID('Torva full helm') },
					{ boostPercent: 1.5, itemID: itemID('Neitiznot faceguard') },
					{ boostPercent: 1, itemID: itemID('Helm of neitiznot') },
					{ boostPercent: 0.5, itemID: itemID('Berserker helm') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Infernal cape') },
					{ boostPercent: 6, itemID: itemID('Mythical cape') },
					{ boostPercent: 3, itemID: itemID('Fire cape') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 9, itemID: itemID("Inquisitor's hauberk") },
					{ boostPercent: 6, itemID: itemID('Torva platebody') },
					{ boostPercent: 3, itemID: itemID('Bandos chestplate') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 9, itemID: itemID("Inquisitor's plateskirt") },
					{ boostPercent: 6, itemID: itemID('Torva platelegs') },
					{ boostPercent: 3, itemID: itemID('Bandos tassets') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 49.5, itemID: itemID('Ursine chainmace') },
					{ boostPercent: 46, itemID: itemID("Viggora's chainmace") },
					{ boostPercent: 21.5, itemID: itemID("Inquisitor's mace") },
					{ boostPercent: 21, itemID: itemID('Abyssal bludgeon') },
					{ boostPercent: 2.5, itemID: itemID('Zamorakian hasta') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 16.5, itemID: itemID('Avernic defender') },
					{ boostPercent: 12.5, itemID: itemID('Dragon defender') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 9, itemID: itemID('Ferocious gloves') },
					{ boostPercent: 5, itemID: itemID('Barrows gloves') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 4, itemID: itemID('Primordial boots') },
					{ boostPercent: 2.5, itemID: itemID('Dragon boots') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Ultor ring') },
					{ boostPercent: 5.5, itemID: itemID('Berserker ring (i)') },
					{ boostPercent: 5, itemID: itemID('Brimstone ring') }
				],
				gearSetup: 'wildy'
			}
		],
		minimumGearRequirements: {
			wildy: {
				[GearStat.AttackCrush]: 73,
				[GearStat.MeleeStrength]: 80,
				[GearStat.DefenceSlash]: 110,
				[GearStat.DefenceMagic]: 30
			}
		},
		levelRequirements: {
			attack: 75,
			strength: 75,
			prayer: 44,
			hitpoints: 70,
			defence: 70,
			magic: 70
		},
		diaryRequirement: [WildernessDiary, WildernessDiary.medium],
		defaultAttackStyles: [SkillsEnum.Attack],
		customMonsterHP: 420,
		healAmountNeeded: 8 * 20,
		attackStyleToUse: GearStat.AttackCrush,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Venenatis.id,
		name: Monsters.Venenatis.name,
		aliases: Monsters.Venenatis.aliases,
		table: Monsters.Venenatis,
		timeToFinish: Time.Minute * 14.35,
		emoji: '<:Venenatis_spiderling:324127379092144129>',
		wildy: true,
		wildyMulti: true,
		canBePked: true,
		pkActivityRating: 9,
		pkBaseDeathChance: 9,

		// Check respawn time
		groupKillable: true,
		respawnTime: Time.Minute * 0.28,

		itemCost: {
			itemCost: new Bank().add('Bronze knife', 1),
			qtyPerMinute: 0.8,
			alternativeConsumables: [
				{ itemCost: new Bank().add('Iron knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Steel knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Black knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Mithril knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Adamant knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Rune knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Dragon knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Rune knife(p++)', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Chinchompa', 1), qtyPerMinute: 0.4 },
				{ itemCost: new Bank().add('Red Chinchompa', 1), qtyPerMinute: 0.4 },
				{ itemCost: new Bank().add('Black Chinchompa', 1), qtyPerMinute: 0.4 }
			]
		},

		difficultyRating: 6,
		qpRequired: 0,
		equippedItemBoosts: [
			{
				items: [
					{ boostPercent: 5.5, itemID: itemID("Inquisitor's great helm") },
					{ boostPercent: 3, itemID: itemID('Torva full helm') },
					{ boostPercent: 2.5, itemID: itemID('Neitiznot faceguard') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 5.5, itemID: itemID('Amulet of torture') },
					{ boostPercent: 4, itemID: itemID('Amulet of strength') },
					{ boostPercent: 2.5, itemID: itemID('Amulet of fury') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Infernal cape') },
					{ boostPercent: 4, itemID: itemID('Mythical cape') },
					{ boostPercent: 3, itemID: itemID('Fire cape') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 10, itemID: itemID("Inquisitor's hauberk") },
					{ boostPercent: 5, itemID: itemID('Torva platebody') },
					{ boostPercent: 3, itemID: itemID('Bandos chestplate') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 10, itemID: itemID("Inquisitor's plateskirt") },
					{ boostPercent: 5, itemID: itemID('Torva platelegs') },
					{ boostPercent: 3, itemID: itemID('Bandos tassets') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 52.5, itemID: itemID('Ursine chainmace') },
					{ boostPercent: 49.5, itemID: itemID("Viggora's chainmace") },
					{ boostPercent: 24.5, itemID: itemID("Inquisitor's mace") },
					{ boostPercent: 24, itemID: itemID('Abyssal bludgeon') },
					{ boostPercent: 1, itemID: itemID('Zamorakian hasta') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 17, itemID: itemID('Avernic defender') },
					{ boostPercent: 14.5, itemID: itemID('Dragon defender') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Ferocious gloves') },
					{ boostPercent: 5, itemID: itemID('Barrows gloves') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 4, itemID: itemID('Primordial boots') },
					{ boostPercent: 2.5, itemID: itemID('Dragon boots') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Ultor ring') },
					{ boostPercent: 5.5, itemID: itemID('Berserker ring (i)') },
					{ boostPercent: 5, itemID: itemID('Brimstone ring') }
				],
				gearSetup: 'wildy'
			}
		],
		minimumGearRequirements: {
			wildy: {
				[GearStat.AttackCrush]: 73,
				[GearStat.MeleeStrength]: 80,
				[GearStat.DefenceStab]: 100,
				[GearStat.DefenceRanged]: 99,
				[GearStat.DefenceMagic]: 30
			}
		},
		levelRequirements: {
			attack: 75,
			strength: 75,
			prayer: 44,
			hitpoints: 70,
			defence: 70,
			magic: 70
		},

		defaultAttackStyles: [SkillsEnum.Attack],
		combatXpMultiplier: 1.525,
		healAmountNeeded: 13 * 20,
		attackStyleToUse: GearStat.AttackCrush,
		attackStylesUsed: [GearStat.AttackStab]
	},
	{
		id: Monsters.Spindel.id,
		name: Monsters.Spindel.name,
		aliases: Monsters.Spindel.aliases,
		table: Monsters.Spindel,
		timeToFinish: Time.Minute * 7.46,
		emoji: '<:Venenatis_spiderling:324127379092144129>',
		wildy: true,
		wildyMulti: false,
		canBePked: true,
		pkActivityRating: 10,
		pkBaseDeathChance: 9,

		itemCost: {
			itemCost: new Bank().add('Bronze knife', 1),
			qtyPerMinute: 0.8,
			alternativeConsumables: [
				{ itemCost: new Bank().add('Iron knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Steel knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Black knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Mithril knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Adamant knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Rune knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Dragon knife', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Rune knife(p++)', 1), qtyPerMinute: 0.8 },
				{ itemCost: new Bank().add('Chinchompa', 1), qtyPerMinute: 0.4 },
				{ itemCost: new Bank().add('Red Chinchompa', 1), qtyPerMinute: 0.4 },
				{ itemCost: new Bank().add('Black Chinchompa', 1), qtyPerMinute: 0.4 }
			]
		},

		difficultyRating: 2,
		qpRequired: 0,
		equippedItemBoosts: [
			{
				items: [
					{ boostPercent: 5.5, itemID: itemID("Inquisitor's great helm") },
					{ boostPercent: 3, itemID: itemID('Torva full helm') },
					{ boostPercent: 2.5, itemID: itemID('Neitiznot faceguard') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 5.5, itemID: itemID('Amulet of torture') },
					{ boostPercent: 4, itemID: itemID('Amulet of strength') },
					{ boostPercent: 2.5, itemID: itemID('Amulet of fury') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Infernal cape') },
					{ boostPercent: 4, itemID: itemID('Mythical cape') },
					{ boostPercent: 3, itemID: itemID('Fire cape') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 10, itemID: itemID("Inquisitor's hauberk") },
					{ boostPercent: 5, itemID: itemID('Torva platebody') },
					{ boostPercent: 3, itemID: itemID('Bandos chestplate') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 10, itemID: itemID("Inquisitor's plateskirt") },
					{ boostPercent: 5, itemID: itemID('Torva platelegs') },
					{ boostPercent: 3, itemID: itemID('Bandos tassets') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 52.5, itemID: itemID('Ursine chainmace') },
					{ boostPercent: 49.5, itemID: itemID("Viggora's chainmace") },
					{ boostPercent: 24.5, itemID: itemID("Inquisitor's mace") },
					{ boostPercent: 24, itemID: itemID('Abyssal bludgeon') },
					{ boostPercent: 1, itemID: itemID('Zamorakian hasta') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 17, itemID: itemID('Avernic defender') },
					{ boostPercent: 14.5, itemID: itemID('Dragon defender') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Ferocious gloves') },
					{ boostPercent: 5, itemID: itemID('Barrows gloves') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 4, itemID: itemID('Primordial boots') },
					{ boostPercent: 2.5, itemID: itemID('Dragon boots') }
				],
				gearSetup: 'wildy'
			},
			{
				items: [
					{ boostPercent: 7.5, itemID: itemID('Ultor ring') },
					{ boostPercent: 5.5, itemID: itemID('Berserker ring (i)') },
					{ boostPercent: 5, itemID: itemID('Brimstone ring') }
				],
				gearSetup: 'wildy'
			}
		],
		minimumGearRequirements: {
			wildy: {
				[GearStat.AttackCrush]: 73,
				[GearStat.MeleeStrength]: 80,
				[GearStat.DefenceStab]: 100,
				[GearStat.DefenceRanged]: 99,
				[GearStat.DefenceMagic]: 30
			}
		},
		levelRequirements: {
			attack: 75,
			strength: 75,
			prayer: 44,
			hitpoints: 70,
			defence: 70,
			magic: 70
		},
		diaryRequirement: [WildernessDiary, WildernessDiary.medium],
		defaultAttackStyles: [SkillsEnum.Attack],
		healAmountNeeded: 8 * 20,
		attackStyleToUse: GearStat.AttackCrush,
		attackStylesUsed: [GearStat.AttackStab]
	},
	{
		id: Monsters.ChaosElemental.id,
		name: Monsters.ChaosElemental.name,
		aliases: Monsters.ChaosElemental.aliases,
		table: Monsters.ChaosElemental,
		timeToFinish: Time.Minute * 4.3,
		emoji: '<:Pet_chaos_elemental:324127377070227456>',
		wildy: true,

		difficultyRating: 8,
		itemsRequired: deepResolveItems([
			['Pernix body', "Black d'hide body", "Karil's leathertop"],
			['Pernix chaps', "Black d'hide chaps", "Karil's leatherskirt"]
		]),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID("Craw's bow")]: 20,
				[itemID('Webweaver bow')]: 25
			},
			{
				[itemID('Archers ring')]: 3,
				[itemID('Archers ring (i)')]: 5
			},
			{
				[itemID('Barrows gloves')]: 3
			}
		],
		defaultAttackStyles: [SkillsEnum.Attack],
		combatXpMultiplier: 1.075,
		healAmountNeeded: 5 * 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.ChaosFanatic.id,
		name: Monsters.ChaosFanatic.name,
		aliases: Monsters.ChaosFanatic.aliases,
		table: Monsters.ChaosFanatic,
		timeToFinish: Time.Minute * 3.3,
		emoji: '<:Ancient_staff:412845709453426689>',
		wildy: true,
		difficultyRating: 6,
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID("Craw's bow")]: 20,
				[itemID('Webweaver bow')]: 25
			},
			{ [itemID("Karil's leathertop")]: 3 },
			{ [itemID("Karil's leatherskirt")]: 3 }
		],
		defaultAttackStyles: [SkillsEnum.Ranged],
		combatXpMultiplier: 1.125,
		healAmountNeeded: 4 * 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.CrazyArchaeologist.id,
		name: Monsters.CrazyArchaeologist.name,
		aliases: Monsters.CrazyArchaeologist.aliases,
		table: Monsters.CrazyArchaeologist,
		timeToFinish: Time.Minute * 2.9,
		emoji: '<:Fedora:456179157303427092>',
		wildy: true,

		difficultyRating: 6,
		qpRequired: 0,
		itemInBankBoosts: [{ [itemID('Occult necklace')]: 10 }],
		defaultAttackStyles: [SkillsEnum.Magic],
		combatXpMultiplier: 1.25,
		healAmountNeeded: 4 * 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Scorpia.id,
		name: Monsters.Scorpia.name,
		aliases: Monsters.Scorpia.aliases,
		table: Monsters.Scorpia,
		timeToFinish: Time.Minute * 3.0,
		emoji: '<:Scorpias_offspring:324127378773377024>',
		wildy: true,
		difficultyRating: 7,
		qpRequired: 0,
		itemInBankBoosts: [{ [itemID('Occult necklace')]: 10 }, { [itemID('Harmonised nightmare staff')]: 10 }],
		defaultAttackStyles: [SkillsEnum.Magic],
		combatXpMultiplier: 1.3,
		healAmountNeeded: 4 * 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	}
];
