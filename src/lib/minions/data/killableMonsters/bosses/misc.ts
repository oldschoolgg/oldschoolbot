import { Monsters } from 'oldschooljs';

import { KillableMonster } from '../../../types';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import itemID from '../../../../util/itemID';
import { Time } from '../../../../constants';
import { bosses } from '../../../../collectionLog';
import { GearSetupTypes, GearStat } from '../../../../gear/types';

const killableBosses: KillableMonster[] = [
	{
		id: Monsters.GiantMole.id,
		name: Monsters.GiantMole.name,
		aliases: Monsters.GiantMole.aliases,
		timeToFinish: Time.Minute * 1.6,
		table: Monsters.GiantMole,
		emoji: '<:Baby_mole:324127375858204672>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems([
			"Dharok's helm",
			"Dharok's platebody",
			"Dharok's platelegs",
			"Dharok's greataxe"
		]),
		notifyDrops: resolveItems(['Baby mole']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Barrows gloves')]: 5,
			[itemID('Berserker ring')]: 5
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Vorkath.id,
		name: Monsters.Vorkath.name,
		aliases: Monsters.Vorkath.aliases,
		timeToFinish: Time.Minute * 3.2,
		table: Monsters.Vorkath,
		emoji: '<:Vorki:400713309252222977>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 8,
		itemsRequired: resolveItems(['Armadyl chestplate', 'Armadyl chainskirt']),
		notifyDrops: resolveItems(['Vorki', 'Jar of decay', 'Draconic visage', 'Skeletal visage']),
		qpRequired: 205,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 10
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Zulrah.id,
		name: Monsters.Zulrah.name,
		aliases: Monsters.Zulrah.aliases,
		timeToFinish: Time.Minute * 3.2,
		table: Monsters.Zulrah,
		emoji: '<:Pet_snakeling:324127377816944642>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 8,
		itemsRequired: resolveItems([
			'Armadyl chestplate',
			'Armadyl chainskirt',
			"Ahrim's robetop",
			"Ahrim's robeskirt"
		]),
		notifyDrops: resolveItems([
			'Tanzanite mutagen',
			'Magma mutagen',
			'Jar of swamp',
			'Pet snakeling'
		]),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Barrows gloves')]: 5,
			[itemID('Ranger boots')]: 5,
			[itemID("Iban's staff")]: 2
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.KalphiteQueen.id,
		name: Monsters.KalphiteQueen.name,
		aliases: Monsters.KalphiteQueen.aliases,
		timeToFinish: Time.Minute * 4,
		table: Monsters.KalphiteQueen,
		emoji: '<:Kalphite_princess_2nd_form:324127376915300352>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: deepResolveItems([
			"Verac's flail",
			"Verac's plateskirt",
			["Black d'hide body", "Karil's leathertop"]
		]),
		notifyDrops: resolveItems(['Jar of sand', 'Kalphite princess']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 10
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.CorporealBeast.id,
		name: Monsters.CorporealBeast.name,
		aliases: Monsters.CorporealBeast.aliases,
		table: Monsters.CorporealBeast,
		timeToFinish: Time.Minute * 18,
		emoji: '<:Pet_dark_core:324127377347313674>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: resolveItems(['Zamorakian spear']),
		notifyDrops: resolveItems([
			'Spectral sigil',
			'Arcane sigil',
			'Elysian sigil',
			'Pet dark core'
		]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Bandos godsword')]: 5,
			[itemID('Dragon warhammer')]: 10
		},
		groupKillable: true,
		respawnTime: 20_000,
		levelRequirements: {
			prayer: 43
		},
		minimumGearRequirements: {
			[GearStat.AttackStab]: 85,
			[GearStat.DefenceCrush]: 150
		},
		uniques: bosses['Corp Beast'],
		healAmountNeeded: 20 * 40,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic]
	},
	{
		id: Monsters.Cerberus.id,
		name: Monsters.Cerberus.name,
		aliases: Monsters.Cerberus.aliases,
		timeToFinish: Time.Minute * 2.65,
		table: Monsters.Cerberus,
		emoji: '<:Hellpuppy:324127376185491458>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: deepResolveItems([
			["Torag's platebody", "Dharok's platebody", 'Bandos chestplate'],
			["Torag's platelegs", "Dharok's platelegs", 'Bandos tassets'],
			'Zamorakian spear'
		]),
		notifyDrops: resolveItems(['Hellpuppy', 'Jar of souls']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Spectral spirit shield')]: 10,
			[itemID('Bandos chestplate')]: 5,
			[itemID('Bandos tassets')]: 5,
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			prayer: 43,
			slayer: 91
		}
	},
	{
		id: Monsters.AbyssalSire.id,
		name: Monsters.AbyssalSire.name,
		aliases: Monsters.AbyssalSire.aliases,
		timeToFinish: Time.Minute * 2.8,
		table: Monsters.AbyssalSire,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems(['Bandos chestplate', 'Bandos tassets']),
		notifyDrops: resolveItems([]),
		qpRequired: 4,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 5,
			[itemID('Scythe of vitur')]: 5,
			[itemID('Arclight')]: 10,
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			prayer: 43,
			slayer: 85
		}
	},
	{
		id: Monsters.AlchemicalHydra.id,
		name: Monsters.AlchemicalHydra.name,
		aliases: Monsters.AlchemicalHydra.aliases,
		timeToFinish: Time.Minute * 3.2,
		table: Monsters.AlchemicalHydra,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots'],
			['Toxic blowpipe (empty)', 'Toxic blowpipe'],
			'Armadyl chainskirt',
			'Armadyl chestplate'
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Twisted bow')]: 15,
			[itemID('Ring of the gods')]: 3,
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			prayer: 43,
			slayer: 95
		}
	},
	{
		id: Monsters.GrotesqueGuardians.id,
		name: Monsters.GrotesqueGuardians.name,
		aliases: Monsters.GrotesqueGuardians.aliases,
		timeToFinish: Time.Minute * 2.5,
		table: Monsters.GrotesqueGuardians,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			['Toxic blowpipe (empty)', 'Toxic blowpipe'],
			'Abyssal whip',
			['Armadyl chainskirt', "Karil's leatherskirt"],
			['Armadyl chestplate', "Karil's leathertop"]
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10,
			[itemID('Saradomin godsword')]: 5
		},
		levelRequirements: {
			prayer: 43,
			slayer: 75
		}
	},
	{
		id: Monsters.Sarachnis.id,
		name: Monsters.Sarachnis.name,
		aliases: Monsters.Sarachnis.aliases,
		timeToFinish: Time.Minute * 1.75,
		table: Monsters.Sarachnis,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems(["Karil's leatherskirt", "Karil's leathertop", 'Knife']),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.ThermonuclearSmokeDevil.id,
		name: Monsters.ThermonuclearSmokeDevil.name,
		aliases: Monsters.ThermonuclearSmokeDevil.aliases,
		timeToFinish: Time.Minute * 1.2,
		table: Monsters.ThermonuclearSmokeDevil,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems(["Ahrim's robeskirt", "Ahrim's robetop"]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10,
			[itemID('Occult necklace')]: 5
		},
		levelRequirements: {
			prayer: 49,
			slayer: 93
		}
	}
];

export default killableBosses;
