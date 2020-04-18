import { Monsters } from 'oldschooljs';

import { Time } from './constants';
import { Bank, ArrayItemsResolved } from './types';
import resolveItems from './util/resolveItems';
import itemID from './util/itemID';

export interface KillableMonster {
	id: number;
	name: string;
	aliases: string[];
	timeToFinish: number;
	table: {
		kill(quantity: number): Bank;
	};
	emoji: string;
	wildy: boolean;
	canBeKilled: boolean;
	difficultyRating: number;
	itemsRequired: ArrayItemsResolved;
	notifyDrops: ArrayItemsResolved;
	qpRequired: number;

	/**
	 * A object of ([key: itemID]: boostPercentage) boosts that apply to
	 * this monster.
	 */
	itemInBankBoosts?: Bank;
}

const killableMonsters: KillableMonster[] = [
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
			[itemID('Barrows gloves')]: 5
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
		itemsRequired: resolveItems([
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
			[itemID('Armadyl chainskirt')]: 2,
			[itemID('Bandos chestplate')]: 2,
			[itemID('Bandos tassets')]: 2
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
		itemsRequired: resolveItems([
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
		itemsRequired: resolveItems([
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
			[itemID('Armadyl chestplate')]: 2,
			[itemID('Armadyl chainskirt')]: 2,
			[itemID('Bandos chestplate')]: 2,
			[itemID('Bandos tassets')]: 2,
			[itemID('Saradomin godsword')]: 2
		}
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
		itemsRequired: resolveItems(['Bandos chestplate', 'Bandos tassets', 'Zamorakian spear']),
		notifyDrops: resolveItems(['Hellpuppy', 'Jar of souls']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Spectral spirit shield')]: 10
		}
	},
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
		notifyDrops: resolveItems(['Baby mole', 'Curved bone']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Barrows gloves')]: 5,
			[itemID('Berserker ring')]: 5
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
		}
	},
	{
		id: Monsters.GeneralGraardor.id,
		name: Monsters.GeneralGraardor.name,
		aliases: Monsters.GeneralGraardor.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.GeneralGraardor,
		emoji: '<:Pet_general_graardor:324127377376673792>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems(['Pet general graardor', 'Curved bone']),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 10
		}
	},
	{
		id: Monsters.CommanderZilyana.id,
		name: Monsters.CommanderZilyana.name,
		aliases: Monsters.CommanderZilyana.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.CommanderZilyana,
		emoji: '<:Pet_zilyana:324127378248957952>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: resolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		notifyDrops: resolveItems(['Pet zilyana']),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Ranger boots')]: 5,
			[itemID('Armadyl crossbow')]: 5
		}
	},
	{
		id: Monsters.Kreearra.id,
		name: Monsters.Kreearra.name,
		aliases: Monsters.Kreearra.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.Kreearra,
		emoji: '<:Pet_kreearra:324127377305239555>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: resolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		notifyDrops: resolveItems(["Pet kree'arra", 'Curved bone']),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Ranger boots')]: 5
		}
	},
	{
		id: Monsters.KrilTsutsaroth.id,
		name: Monsters.KrilTsutsaroth.name,
		aliases: Monsters.KrilTsutsaroth.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.KrilTsutsaroth,
		emoji: '<:Pet_kril_tsutsaroth:324127377527406594>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 7,
		itemsRequired: resolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		notifyDrops: resolveItems(["Pet k'ril tsutsaroth"]),
		qpRequired: 75,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 10
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems(['Goblin champion scroll']),
		qpRequired: 0
	},
	{
		id: Monsters.Callisto.id,
		name: Monsters.Callisto.name,
		aliases: Monsters.Callisto.aliases,
		table: Monsters.Callisto,
		timeToFinish: Time.Minute * 6,
		emoji: '<:Callisto_cub:324127376273440768>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		itemsRequired: resolveItems([
			"Verac's helm",
			"Verac's brassard",
			"Verac's plateskirt",
			"Verac's flail"
		]),
		notifyDrops: resolveItems(['Callisto cub', 'Curved bone', 'Tyrannical ring']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Proselyte hauberk')]: 2,
			[itemID('Proselyte cuisse')]: 2
		}
	},
	{
		id: Monsters.Vetion.id,
		name: Monsters.Vetion.name,
		aliases: Monsters.Vetion.aliases,
		table: Monsters.Vetion,
		timeToFinish: Time.Minute * 4.4,
		emoji: '<:Vetion_jr:324127378999738369>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 8,
		itemsRequired: resolveItems([
			"Verac's helm",
			"Verac's brassard",
			"Verac's plateskirt",
			"Verac's flail"
		]),
		notifyDrops: resolveItems([
			"Vet'ion jr.",
			'Skeleton champion scroll',
			'Curved bone',
			'Ring of the gods'
		]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Bandos godsword')]: 3,
			[itemID('Dragon warhammer')]: 3
		}
	},
	{
		id: Monsters.Venenatis.id,
		name: Monsters.Venenatis.name,
		aliases: Monsters.Venenatis.aliases,
		table: Monsters.Venenatis,
		timeToFinish: Time.Minute * 5,
		emoji: '<:Venenatis_spiderling:324127379092144129>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 9,
		itemsRequired: resolveItems([
			"Verac's helm",
			"Verac's brassard",
			"Verac's plateskirt",
			"Verac's flail"
		]),
		notifyDrops: resolveItems(['Treasonous ring', 'Venenatis spiderling', 'Curved bone']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Barrows gloves')]: 3
		}
	},
	{
		id: Monsters.ChaosElemental.id,
		name: Monsters.ChaosElemental.name,
		aliases: Monsters.ChaosElemental.aliases,
		table: Monsters.ChaosElemental,
		timeToFinish: Time.Minute * 4.3,
		emoji: '<:Pet_chaos_elemental:324127377070227456>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 8,
		itemsRequired: resolveItems(["Black d'hide body", "Black d'hide chaps"]),
		notifyDrops: resolveItems(['Pet chaos elemental']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Archers ring')]: 3,
			[itemID('Barrows gloves')]: 3
		}
	},
	{
		id: Monsters.ChaosFanatic.id,
		name: Monsters.ChaosFanatic.name,
		aliases: Monsters.ChaosFanatic.aliases,
		table: Monsters.ChaosFanatic,
		timeToFinish: Time.Minute * 3.3,
		emoji: '<:Ancient_staff:412845709453426689>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems(['Pet chaos elemental']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID("Karil's leathertop")]: 3,
			[itemID("Karil's leatherskirt")]: 3
		}
	},
	{
		id: Monsters.CrazyArchaeologist.id,
		name: Monsters.CrazyArchaeologist.name,
		aliases: Monsters.CrazyArchaeologist.aliases,
		table: Monsters.CrazyArchaeologist,
		timeToFinish: Time.Minute * 2.9,
		emoji: '<:Fedora:456179157303427092>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Occult necklace')]: 10
		}
	},
	{
		id: Monsters.KingBlackDragon.id,
		name: Monsters.KingBlackDragon.name,
		aliases: Monsters.KingBlackDragon.aliases,
		table: Monsters.KingBlackDragon,
		timeToFinish: Time.Minute * 3.1,
		emoji: '<:Prince_black_dragon:324127378538364928>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 6,
		itemsRequired: resolveItems([
			'Anti-dragon shield',
			['Armadyl crossbow', 'Rune crossbow'],
			["Black d'hide body", "Black d'hide body (g)", "Black d'hide body (t)"],
			["Black d'hide chaps", "Black d'hide chaps (g)", "Black d'hide chaps (t)"]
		]),
		notifyDrops: resolveItems(['Dragon pickaxe', 'Prince black dragon', 'Draconic visage']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Armadyl crossbow')]: 10
		}
	},
	{
		id: Monsters.Scorpia.id,
		name: Monsters.Scorpia.name,
		aliases: Monsters.Scorpia.aliases,
		table: Monsters.Scorpia,
		timeToFinish: Time.Minute * 3.3,
		emoji: '<:Scorpias_offspring:324127378773377024>',
		wildy: true,
		canBeKilled: true,
		difficultyRating: 8,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems(["Scorpia's offspring"]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Occult necklace')]: 10
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
		itemsRequired: resolveItems(['Bandos godsword', "Verac's plateskirt", "Black d'hide body"]),
		notifyDrops: resolveItems(['Jar of sand', 'Kalphite princess']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 10
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
		itemsRequired: resolveItems([["Karil's crossbow", 'Rune crossbow', 'Armadyl crossbow']]),
		notifyDrops: resolveItems(['Dragon warhammer', 'Curved bone']),
		qpRequired: 30,
		itemInBankBoosts: {
			[itemID('Ring of the gods')]: 3
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
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
		itemsRequired: resolveItems([]),
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
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
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
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
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0
	}
];

export default killableMonsters;
