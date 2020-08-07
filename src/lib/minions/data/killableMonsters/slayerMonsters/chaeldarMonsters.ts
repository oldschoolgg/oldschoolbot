import { Monsters } from 'oldschooljs';
import { KillableMonster } from '../../../types';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import itemID from '../../../../util/itemID';
import { Time } from '../../../../constants';
// import { GearSetupTypes, GearStat } from '../../../../gear/types';

const ChaeldarMonsters: KillableMonster[] = [
	{
		id: Monsters.AncientZygomite.id,
		name: Monsters.AncientZygomite.name,
		aliases: Monsters.AncientZygomite.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.AncientZygomite,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Fungicide spray 10']),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 57
		}
	},
	{
		id: Monsters.Aviansie.id,
		name: Monsters.Aviansie.name,
		aliases: Monsters.Aviansie.aliases,
		timeToFinish: Time.Second * 60,
		table: Monsters.Aviansie,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.BlackDemon.id,
		name: Monsters.BlackDemon.name,
		aliases: Monsters.BlackDemon.aliases,
		timeToFinish: Time.Second * 34,
		table: Monsters.BlackDemon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {}
	},
	{
		id: Monsters.CaveHorror.id,
		name: Monsters.CaveHorror.name,
		aliases: Monsters.CaveHorror.aliases,
		timeToFinish: Time.Second * 24,
		table: Monsters.CaveHorror,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: deepResolveItems([
			'Witchwood icon',
			"Guthan's warspear",
			"Guthan's chainskirt",
			"Guthan's platebody",
			"Guthan's helm"
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 20,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 58
		},
		superiorTable: Monsters.CaveAbomination
	},
	{
		id: Monsters.CaveKraken.id,
		name: Monsters.CaveKraken.name,
		aliases: Monsters.CaveKraken.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.CaveKraken,
		emoji: '<:fishing:630911040091193356>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			slayer: 87
		}
	},
	{
		id: Monsters.FossilIslandWyvernAncient.id,
		name: Monsters.FossilIslandWyvernAncient.name,
		aliases: Monsters.FossilIslandWyvernAncient.aliases,
		timeToFinish: Time.Second * 130,
		table: Monsters.FossilIslandWyvernAncient,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 2,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 82
		}
	},
	{
		id: Monsters.FossilIslandWyvernLongTailed.id,
		name: Monsters.FossilIslandWyvernLongTailed.name,
		aliases: Monsters.FossilIslandWyvernLongTailed.aliases,
		timeToFinish: Time.Second * 73,
		table: Monsters.FossilIslandWyvernLongTailed,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 2,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 66
		}
	},
	{
		id: Monsters.FossilIslandWyvernSpitting.id,
		name: Monsters.FossilIslandWyvernSpitting.name,
		aliases: Monsters.FossilIslandWyvernSpitting.aliases,
		timeToFinish: Time.Second * 73,
		table: Monsters.FossilIslandWyvernSpitting,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 2,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 66
		}
	},
	{
		id: Monsters.FossilIslandWyvernTaloned.id,
		name: Monsters.FossilIslandWyvernTaloned.name,
		aliases: Monsters.FossilIslandWyvernTaloned.aliases,
		timeToFinish: Time.Second * 73,
		table: Monsters.FossilIslandWyvernTaloned,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 2,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 66
		}
	},
	{
		id: Monsters.GreaterDemon.id,
		name: Monsters.GreaterDemon.name,
		aliases: Monsters.GreaterDemon.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.GreaterDemon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {}
	},
	{
		id: Monsters.IronDragon.id,
		name: Monsters.IronDragon.name,
		aliases: Monsters.IronDragon.aliases,
		timeToFinish: Time.Second * 80,
		table: Monsters.IronDragon,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Kraken.id,
		name: Monsters.Kraken.name,
		aliases: Monsters.Kraken.aliases,
		timeToFinish: Time.Second * 95,
		table: Monsters.Kraken,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			['Trident of the seas', 'Trident of the seas (full)', 'Uncharged trident']
		]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 87
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
		qpRequired: 30,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 6
		}
	},
	{
		id: Monsters.LizardmanBrute.id,
		name: Monsters.LizardmanBrute.name,
		aliases: Monsters.LizardmanBrute.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.LizardmanBrute,
		emoji: '<:Xerics_talisman_inert:456176488669249539>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		qpRequired: 30,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 6
		}
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
			[itemID('Ring of the gods')]: 3,
			[itemID('Slayer helmet')]: 6
		},
		levelRequirements: {
			prayer: 43
		}
	},
	{
		id: Monsters.Porazdir.id,
		name: Monsters.Porazdir.name,
		aliases: Monsters.Porazdir.aliases,
		timeToFinish: Time.Minute * 5,
		table: Monsters.Porazdir,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			[
				'Zamorak staff',
				'Staff of the dead',
				'Toxic staff (uncharged)',
				'Toxic staff of the dead'
			]
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet (i)')]: 15
		},
		levelRequirements: {}
	} /*
	{
		id: Monsters.ReanimateTzHaar.id,
		name: Monsters.ReanimateTzHaar.name,
		aliases: Monsters.ReanimatedTzHaar.aliases,
		timeToFinish: Time.Second * 2,
		table: Monsters.ReanimatedTzHaar,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 5
		},
		levelRequirements: {
			slayer: 5
		}
	},
	*/,
	{
		id: Monsters.SkeletalWyvern.id,
		name: Monsters.SkeletalWyvern.name,
		aliases: Monsters.SkeletalWyvern.aliases,
		timeToFinish: Time.Second * 80,
		table: Monsters.SkeletalWyvern,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 4,
		itemsRequired: deepResolveItems([
			[
				'Elemental shield',
				'Mind shield',
				'Dragonfire shield',
				'Dragonfire ward',
				'Ancient wyvern shield'
			]
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 12
		},
		levelRequirements: {
			slayer: 72
		}
	},
	{
		id: Monsters.Skotizo.id,
		name: Monsters.Skotizo.name,
		aliases: Monsters.Skotizo.aliases,
		timeToFinish: Time.Second * 160,
		table: Monsters.Skotizo,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		itemsRequired: resolveItems(['Dark totem']),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 15,
			[itemID('Arclight')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.TzHaarKet.id,
		name: Monsters.TzHaarKet.name,
		aliases: Monsters.TzHaarKet.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.TzHaarKet,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {}
	},
	{
		id: Monsters.Wyrm.id,
		name: Monsters.Wyrm.name,
		aliases: Monsters.Wyrm.aliases,
		timeToFinish: Time.Second * 30,
		table: Monsters.Wyrm,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 3,
		itemsRequired: deepResolveItems([
			['Boots of stone', 'Boots of brimstone', 'Granite boots']
		]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 8,
			[itemID('Dragon hunter crossbow')]: 3,
			[itemID('Dragon hunter lance')]: 3
		},
		levelRequirements: {
			slayer: 62
		},
		superiorTable: Monsters.ShadowWyrm
	},
	{
		id: Monsters.Zygomite.id,
		name: Monsters.Zygomite.name,
		aliases: Monsters.Zygomite.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.Zygomite,
		emoji: '<:fishing:630911040091193356>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 2,
		itemsRequired: resolveItems(['Fungicide spray 10']),
		notifyDrops: resolveItems([]),
		qpRequired: 3,
		itemInBankBoosts: {
			[itemID('Slayer helmet')]: 10
		},
		levelRequirements: {
			slayer: 57
		}
	}
];

export default ChaeldarMonsters;
