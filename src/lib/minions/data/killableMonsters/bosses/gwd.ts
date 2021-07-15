import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import {
	CommanderZilyanaCl,
	GeneralGraardorCl,
	KreeArraCl,
	KrilTsutsarothCl
} from '../../../../data/CollectionsExport';
import { GearStat } from '../../../../gear';
import { SkillsEnum } from '../../../../skilling/types';
import itemID from '../../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';

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
		qpRequired: 75,
		itemInBankBoosts: [
			{
				[itemID('Dragon warhammer')]: 10,
				[itemID('Bandos godsword')]: 5
			}
		],
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			strength: 70
		},
		uniques: [...resolveItems(['Rune sword']), ...GeneralGraardorCl],
		defaultAttackStyles: [SkillsEnum.Attack],
		customMonsterHP: 656,
		combatXpMultiplier: 1.126,
		healAmountNeeded: 20 * 5,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackRanged]
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
		qpRequired: 75,
		itemInBankBoosts: [
			{
				[itemID('Ranger boots')]: 3,
				[itemID('Pegasian boots')]: 5
			},
			{
				[itemID('Armadyl crossbow')]: 5,
				[itemID('Twisted bow')]: 10
			}
		],
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			agility: 70
		},
		uniques: CommanderZilyanaCl,
		itemsRequired: deepResolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		defaultAttackStyles: [SkillsEnum.Ranged],
		customMonsterHP: 723,
		combatXpMultiplier: 1.132,
		healAmountNeeded: 18 * 4,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackRanged, GearStat.AttackMagic]
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
		qpRequired: 75,
		itemInBankBoosts: [
			{
				[itemID('Armadyl crossbow')]: 5,
				[itemID('Twisted bow')]: 10
			}
		],
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 40,
			ranged: 70
		},
		uniques: KreeArraCl,
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
		attackStylesUsed: [GearStat.AttackCrush, GearStat.AttackMagic]
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
		qpRequired: 75,
		itemInBankBoosts: [
			{
				[itemID('Dragon warhammer')]: 10,
				[itemID('Bandos godsword')]: 5,
				[itemID('Dragon claws')]: 3
			},
			{
				[itemID('Arclight')]: 9
			}
		],
		groupKillable: true,
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: KrilTsutsarothCl,
		itemsRequired: deepResolveItems([
			["Karil's leathertop", 'Armadyl chestplate'],
			["Karil's leatherskirt", 'Armadyl chainskirt']
		]),
		defaultAttackStyles: [SkillsEnum.Attack],
		customMonsterHP: 708,
		combatXpMultiplier: 1.135,
		healAmountNeeded: 20 * 3,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic]
	}
];

export default killableBosses;
