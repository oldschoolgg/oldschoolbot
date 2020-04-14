import { Monsters } from 'oldschooljs';

import { Bank, ArrayItemsResolved } from '../../types';
import { Time } from 'oldschooljs/dist/constants';
import itemID from '../../util/itemID';
import resolveItems from '../../util/resolveItems';

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

const generalBosses: KillableMonster[] = [
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
		qpRequired: 0
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
		qpRequired: 0
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
		qpRequired: 0
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
		qpRequired: 0
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
		qpRequired: 0
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
		qpRequired: 205
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
		qpRequired: 75
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
		itemsRequired: resolveItems([]),
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
		qpRequired: 30
	}
];

export default generalBosses;
