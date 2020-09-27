import { Monsters } from 'oldschooljs';

import { Time } from '../../../constants';
import { GearSetupTypes, GearStat } from '../../../gear/types';
import itemID from '../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../util/resolveItems';
import { makeKillTable } from '../../../util/setCustomMonster';
import { KillableMonster } from '../../types';
import bosses from './bosses';
import AbyssalDragon, { AbyssalDragonLootTable } from './custom/AbyssalDragon';
import KingGoldemar, { KingGoldemarLootTable } from './custom/KingGoldemar';
import SeaKraken, { KrakenTable } from './custom/SeaKraken';

const killableMonsters: KillableMonster[] = [
	...bosses,
	{
		id: Monsters.Barrows.id,
		name: Monsters.Barrows.name,
		aliases: Monsters.Barrows.aliases,
		timeToFinish: Time.Minute * 4.15,
		table: Monsters.Barrows,
		emoji: '<:Dharoks_helm:403038864199122947>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Barrows gloves')]: 2,
			[itemID("Iban's staff")]: 5
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.DagannothPrime.id,
		name: Monsters.DagannothPrime.name,
		aliases: Monsters.DagannothPrime.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothPrime,
		emoji: '<:Pet_dagannoth_prime:324127376877289474>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth prime']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Armadyl chestplate')]: 2,
			[itemID('Armadyl chainskirt')]: 2
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.DagannothRex.id,
		name: Monsters.DagannothRex.name,
		aliases: Monsters.DagannothRex.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothRex,
		emoji: '<:Pet_dagannoth_rex:324127377091330049>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Bandos chestplate', "Torag's platebody"],
			['Bandos tassets', "Torag's platelegs"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth rex']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Occult necklace')]: 5,
			[itemID("Iban's staff")]: 5
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.DagannothSupreme.id,
		name: Monsters.DagannothSupreme.name,
		aliases: Monsters.DagannothSupreme.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothSupreme,
		emoji: '<:Pet_dagannoth_supreme:324127377066164245>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Bandos chestplate', "Torag's platebody"],
			['Bandos tassets', "Torag's platelegs"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth supreme']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Bandos chestplate')]: 2,
			[itemID('Bandos tassets')]: 2,
			[itemID('Saradomin godsword')]: 2
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Man.id,
		name: Monsters.Man.name,
		aliases: Monsters.Man.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Man,
		emoji: '🧍‍♂️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Guard.id,
		name: Monsters.Guard.name,
		aliases: Monsters.Guard.aliases,
		timeToFinish: Time.Second * 7.4,
		table: Monsters.Guard,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Woman.id,
		name: Monsters.Woman.name,
		aliases: Monsters.Woman.aliases,
		timeToFinish: Time.Second * 4.69,
		table: Monsters.Woman,
		emoji: '🧍‍♀️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Goblin.id,
		name: Monsters.Goblin.name,
		aliases: Monsters.Goblin.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Goblin,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Goblin champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.LizardmanShaman.id,
		name: Monsters.LizardmanShaman.name,
		aliases: Monsters.LizardmanShaman.aliases,
		timeToFinish: Time.Minute * 1.1,
		table: Monsters.LizardmanShaman,
		emoji: '<:Dragon_warhammer:405998717154623488>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			["Karil's crossbow", 'Rune crossbow', 'Armadyl crossbow']
		]),
		notifyDrops: resolveItems(['Dragon warhammer']),
		qpRequired: 30,
		itemInBankBoosts: {
			[itemID('Ring of the gods')]: 3
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Lizardman.id,
		name: Monsters.Lizardman.name,
		aliases: Monsters.Lizardman.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.Lizardman,
		emoji: '<:Xerics_talisman_inert:456176488669249539>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 30
	},
	{
		id: Monsters.GreaterDemon.id,
		name: Monsters.GreaterDemon.name,
		aliases: Monsters.GreaterDemon.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.GreaterDemon,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		qpRequired: 0
	},
	{
		id: Monsters.Cow.id,
		name: Monsters.Cow.name,
		aliases: Monsters.Cow.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Cow,
		emoji: '🐮',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Skeleton.id,
		name: Monsters.Skeleton.name,
		aliases: Monsters.Skeleton.aliases,
		timeToFinish: Time.Second * 9,
		table: Monsters.Skeleton,
		emoji: '☠️',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Skeleton champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.Zombie.id,
		name: Monsters.Zombie.name,
		aliases: Monsters.Zombie.aliases,
		timeToFinish: Time.Second * 9,
		table: Monsters.Zombie,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Zombie champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.Rat.id,
		name: Monsters.Rat.name,
		aliases: Monsters.Rat.aliases,
		timeToFinish: Time.Second * 1.5,
		table: Monsters.Rat,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.FireGiant.id,
		name: Monsters.FireGiant.name,
		aliases: Monsters.FireGiant.aliases,
		timeToFinish: Time.Second * 16,
		table: Monsters.FireGiant,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Giant champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.BlueDragon.id,
		name: Monsters.BlueDragon.name,
		aliases: Monsters.BlueDragon.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.BlueDragon,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Zamorakian spear')]: 10
		}
	},
	{
		id: Monsters.Ankou.id,
		name: Monsters.Ankou.name,
		aliases: Monsters.Ankou.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.Ankou,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Dwarf.id,
		name: Monsters.Dwarf.name,
		aliases: Monsters.Dwarf.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Dwarf,
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: KingGoldemar.id,
		name: KingGoldemar.name,
		aliases: KingGoldemar.aliases,
		timeToFinish: Time.Minute * 22,
		table: {
			kill: makeKillTable(KingGoldemarLootTable)
		},
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 26,
		healAmountNeeded: 20 * 20,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush],
		minimumGearRequirements: {
			[GearStat.DefenceCrush]: 150,
			[GearStat.AttackCrush]: 80
		},
		groupKillable: true,
		respawnTime: Time.Second * 20,
		levelRequirements: {
			prayer: 43
		},
		uniques: resolveItems(['Dwarven warhammer', 'Dwarven crate', 'Dwarven ore']),
		notifyDrops: resolveItems(['Dwarven warhammer'])
	},
	{
		id: SeaKraken.id,
		name: SeaKraken.name,
		aliases: SeaKraken.aliases,
		timeToFinish: Time.Minute * 17,
		table: {
			kill: makeKillTable(KrakenTable)
		},
		emoji: '',
		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0,
		healAmountNeeded: 20 * 20,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic],
		minimumGearRequirements: {
			[GearStat.DefenceMagic]: 150,
			[GearStat.AttackRanged]: 80
		},
		groupKillable: true,
		respawnTime: Time.Second * 20,
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: AbyssalDragon.id,
		name: AbyssalDragon.name,
		aliases: AbyssalDragon.aliases,
		timeToFinish: Time.Minute * 30,
		table: {
			kill: makeKillTable(AbyssalDragonLootTable)
		},
		emoji: '',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		qpRequired: 999,
		healAmountNeeded: 20 * 25,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [
			GearStat.AttackStab,
			GearStat.AttackSlash,
			GearStat.AttackMagic,
			GearStat.AttackRanged
		],
		minimumGearRequirements: {
			[GearStat.AttackStab]: 120,
			[GearStat.DefenceStab]: 150,
			[GearStat.DefenceSlash]: 180,
			[GearStat.DefenceMagic]: -20,
			[GearStat.DefenceRanged]: 150
		},
		itemInBankBoosts: {
			[itemID('Saradomin godsword')]: 5,
			[itemID('Dragon warhammer')]: 5,
			[itemID('Bandos godsword')]: 5,
			[itemID('Dragon hunter lance')]: 10
		},
		itemsRequired: deepResolveItems([
			['Dragonfire shield', 'Dragonfire ward', 'Ancient wyvern shield', 'Abyssal cape']
		]),
		groupKillable: true,
		respawnTime: Time.Second * 20,
		levelRequirements: {
			prayer: 99
		},
		uniques: resolveItems(['Abyssal thread', 'Abyssal cape', 'Ori']),
		notifyDrops: resolveItems(['Abyssal cape', 'Ori'])
	}
];

export default killableMonsters;
