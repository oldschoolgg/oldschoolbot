import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import { deepResolveItems, resolveItems } from 'oldschooljs/dist/util/util';
import {
	commanderZilyanaCL,
	generalGraardorCL,
	kreeArraCL,
	krilTsutsarothCL
} from '../../../../data/CollectionsExport';
import { GearStat } from '../../../../gear/types';
import { SkillsEnum } from '../../../../skilling/types';
import itemID from '../../../../util/itemID';
import type { KillableMonster } from '../../../types';

const killableBosses: KillableMonster[] = [
	{
		id: Monsters.GeneralGraardor.id,
		name: Monsters.GeneralGraardor.name,
		aliases: Monsters.GeneralGraardor.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.GeneralGraardor,
		emoji: '<:Pet_general_graardor:324127377376673792>',
		wildy: false,

		difficultyRating: 7,
		notifyDrops: resolveItems(['Pet general graardor']),
		qpRequired: 1,
		itemInBankBoosts: [
			{
				[itemID('Dragon warhammer')]: 10,
				[itemID('Bandos godsword')]: 5
			},
			{
				[itemID("Osmumten's fang")]: 3
			},
			{
				[itemID('Lightbearer')]: 1
			}
		],
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			strength: 70
		},
		uniques: [...resolveItems(['Rune sword']), ...generalGraardorCL],
		defaultAttackStyles: [SkillsEnum.Attack],
		customMonsterHP: 656,
		combatXpMultiplier: 1.126,
		healAmountNeeded: 20 * 5,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackRanged],
		specialLoot: async ({ loot, ownedItems }) => {
			if (!ownedItems.has('Frozen key') && !ownedItems.has('Frozen key piece (bandos)')) {
				loot.add('Frozen key piece (bandos)');
			}
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

		difficultyRating: 7,
		notifyDrops: resolveItems(['Pet zilyana']),
		qpRequired: 1,
		itemInBankBoosts: [
			{
				[itemID('Ranger boots')]: 3,
				[itemID('Pegasian boots')]: 5
			},
			{
				[itemID('Armadyl crossbow')]: 5,
				[itemID('Bow of faerdhinen (c)')]: 7,
				[itemID('Zaryte crossbow')]: 8,
				[itemID('Twisted bow')]: 10
			},
			{
				[itemID('Masori body (f)')]: 1
			},
			{
				[itemID('Masori chaps (f)')]: 1
			},
			{
				[itemID('Masori mask (f)')]: 1
			}
		],
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			agility: 70
		},
		uniques: commanderZilyanaCL,
		itemsRequired: deepResolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		defaultAttackStyles: [SkillsEnum.Ranged],
		customMonsterHP: 723,
		combatXpMultiplier: 1.132,
		healAmountNeeded: 18 * 4,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackRanged, GearStat.AttackMagic],
		specialLoot: async ({ loot, ownedItems }) => {
			if (!ownedItems.has('Frozen key') && !ownedItems.has('Frozen key piece (saradomin)')) {
				loot.add('Frozen key piece (saradomin)');
			}
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

		difficultyRating: 7,
		notifyDrops: resolveItems(["Pet kree'arra"]),
		qpRequired: 1,
		itemInBankBoosts: [
			{
				[itemID('Armadyl crossbow')]: 5,
				[itemID('Bow of faerdhinen (c)')]: 7,
				[itemID('Zaryte crossbow')]: 8,
				[itemID('Twisted bow')]: 10
			},
			{
				[itemID('Masori body (f)')]: 1
			},
			{
				[itemID('Masori chaps (f)')]: 1
			},
			{
				[itemID('Masori mask (f)')]: 1
			}
		],
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 40,
			ranged: 70
		},
		uniques: kreeArraCL,
		itemsRequired: deepResolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		defaultAttackStyles: [SkillsEnum.Ranged],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Magic],
		customMonsterHP: 641,
		combatXpMultiplier: 1.159,
		healAmountNeeded: 18 * 4,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic],
		specialLoot: async ({ loot, ownedItems }) => {
			if (!ownedItems.has('Frozen key') && !ownedItems.has('Frozen key piece (armadyl)')) {
				loot.add('Frozen key piece (armadyl)');
			}
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

		difficultyRating: 7,
		notifyDrops: resolveItems(["Pet k'ril tsutsaroth"]),
		qpRequired: 1,
		itemInBankBoosts: [
			{
				[itemID('Dragon warhammer')]: 10,
				[itemID('Bandos godsword')]: 5,
				[itemID('Dragon claws')]: 3
			},
			{
				[itemID('Arclight')]: 9,
				[itemID('Twisted bow')]: 10,
				[itemID('Emberlight')]: 14,
				[itemID('Scorching bow')]: 20
			}
		],
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: krilTsutsarothCL,
		itemsRequired: deepResolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		defaultAttackStyles: [SkillsEnum.Attack],
		customMonsterHP: 708,
		combatXpMultiplier: 1.135,
		healAmountNeeded: 20 * 3,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic],
		specialLoot: async ({ loot, ownedItems }) => {
			if (!ownedItems.has('Frozen key') && !ownedItems.has('Frozen key piece (zamorak)')) {
				loot.add('Frozen key piece (zamorak)');
			}
		}
	}
];

export default killableBosses;
