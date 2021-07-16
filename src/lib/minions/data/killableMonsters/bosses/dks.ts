import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import { GearStat } from '../../../../gear/types';
import { SkillsEnum } from '../../../../skilling/types';
import itemID from '../../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';
import DagannothKings, { DagannothKingsMonsterGroup } from './groups/DagannothKings';

const dagannothKingsBosses: KillableMonster[] = [
	{
		id: Monsters.DagannothPrime.id,
		name: Monsters.DagannothPrime.name,
		aliases: Monsters.DagannothPrime.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothPrime,
		emoji: '<:Pet_dagannoth_prime:324127376877289474>',
		wildy: false,

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
		itemInBankBoosts: [
			{
				[itemID('Armadyl chestplate')]: 2
			},
			{
				[itemID('Armadyl chainskirt')]: 2
			},
			{
				[itemID('Twisted bow')]: 6
			}
		],
		levelRequirements: {
			prayer: 43
		},
		combatXpMultiplier: 1.3,
		healAmountNeeded: 100,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.DagannothRex.id,
		name: Monsters.DagannothRex.name,
		aliases: Monsters.DagannothRex.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothRex,
		emoji: '<:Pet_dagannoth_rex:324127377091330049>',
		wildy: false,

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
		itemInBankBoosts: [
			{
				[itemID("Iban's staff")]: 3,
				[itemID('Harmonised nightmare staff')]: 5
			},
			{
				[itemID('Occult necklace')]: 5
			}
		],
		levelRequirements: {
			prayer: 43
		},
		combatXpMultiplier: 1.3,
		healAmountNeeded: 100,
		attackStyleToUse: GearStat.AttackMagic,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.DagannothSupreme.id,
		name: Monsters.DagannothSupreme.name,
		aliases: Monsters.DagannothSupreme.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothSupreme,
		emoji: '<:Pet_dagannoth_supreme:324127377066164245>',
		wildy: false,

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
		itemInBankBoosts: [
			{
				[itemID('Bandos chestplate')]: 2
			},
			{
				[itemID('Bandos tassets')]: 2
			},
			{
				[itemID('Saradomin godsword')]: 4,
				[itemID('Dragon claws')]: 6
			}
		],
		levelRequirements: {
			prayer: 43
		},
		healAmountNeeded: 100,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackRanged]
	}
];
const killableBosses: KillableMonster[] = [
	...dagannothKingsBosses,
	{
		id: DagannothKings.id,
		name: DagannothKings.name,
		aliases: DagannothKings.aliases,
		timeToFinish: Time.Minute * 1.75,
		table: DagannothKings,
		wildy: false,

		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"],
			['Bandos chestplate', "Torag's platebody"],
			['Bandos tassets', "Torag's platelegs"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth rex', 'Pet dagannoth supreme', 'Pet dagannoth prime']),
		qpRequired: 0,
		itemInBankBoosts: [
			...dagannothKingsBosses.flatMap(dks => dks.itemInBankBoosts!),
			{
				[itemID('Saradomin godsword')]: 10
			}
		],
		levelRequirements: {
			prayer: 43,
			defence: 70,
			ranged: 70,
			attack: 70,
			strength: 70,
			magic: 70
		},
		healAmountNeeded: 100,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackStab, GearStat.AttackRanged],
		defaultAttackStyles: [SkillsEnum.Ranged, SkillsEnum.Magic, SkillsEnum.Attack, SkillsEnum.Strength],
		combatXpMultiplier: 1.075,
		isGroupMonster: true,
		groupMonsters: DagannothKingsMonsterGroup,
		minimumKC: 3
	}
];

export default killableBosses;
