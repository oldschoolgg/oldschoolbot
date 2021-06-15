import { Monsters } from 'oldschooljs';
import SimpleMonster from 'oldschooljs/dist/structures/SimpleMonster';

import { Time } from '../../../../constants';
import { bosses } from '../../../../data/collectionLog';
import { GearSetupTypes, GearStat } from '../../../../gear/types';
import { CorporealBeastTable } from '../../../../simulation/Corp';
import { SkillsEnum } from '../../../../skilling/types';
import itemID from '../../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';

const killableBosses: KillableMonster[] = [
	{
		id: Monsters.GiantMole.id,
		name: Monsters.GiantMole.name,
		aliases: Monsters.GiantMole.aliases,
		timeToFinish: Time.Minute * 1.6,
		table: Monsters.GiantMole,
		emoji: '<:Baby_mole:324127375858204672>',
		wildy: false,

		difficultyRating: 3,
		itemsRequired: resolveItems(["Dharok's helm", "Dharok's platebody", "Dharok's platelegs", "Dharok's greataxe"]),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Barrows gloves')]: 5
			},
			{
				[itemID('Berserker ring')]: 5,
				[itemID('Berserker ring (i)')]: 7,
				[itemID('Twisted bow')]: 10
			}
		],
		levelRequirements: {
			prayer: 43
		},
		defaultAttackStyles: [SkillsEnum.Attack],
		combatXpMultiplier: 1.075
	},
	{
		id: Monsters.Vorkath.id,
		name: Monsters.Vorkath.name,
		aliases: Monsters.Vorkath.aliases,
		timeToFinish: Time.Minute * 3.2,
		table: Monsters.Vorkath,
		emoji: '<:Vorki:400713309252222977>',
		wildy: false,

		difficultyRating: 8,
		itemsRequired: resolveItems(['Armadyl chestplate', 'Armadyl chainskirt']),
		qpRequired: 205,
		itemInBankBoosts: [
			{
				[itemID('Bandos godsword')]: 15,
				[itemID('Dragon warhammer')]: 15,
				[itemID('Dragon claws')]: 10
			},
			{
				[itemID('Dragon hunter lance')]: 20,
				[itemID('Dragon hunter crossbow')]: 30
			},
			{
				[itemID('Salve amulet (ei)')]: 15,
				[itemID('Salve amulet (i)')]: 10
			}
		],
		levelRequirements: {
			prayer: 43
		},
		healAmountNeeded: 20 * 20,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
		defaultAttackStyles: [SkillsEnum.Ranged]
	},
	{
		id: Monsters.Zulrah.id,
		name: Monsters.Zulrah.name,
		aliases: Monsters.Zulrah.aliases,
		timeToFinish: Time.Minute * 3.2,
		table: Monsters.Zulrah,
		emoji: '<:Pet_snakeling:324127377816944642>',
		wildy: false,

		difficultyRating: 8,
		qpRequired: 75,
		itemInBankBoosts: [
			{
				[itemID('Ranger boots')]: 2,
				[itemID('Pegasian boots')]: 4
			},
			{
				[itemID("Iban's staff")]: 2,
				[itemID('Harmonised nightmare staff')]: 5
			},
			{
				[itemID('Barrows gloves')]: 3
			},
			{
				[itemID('Twisted bow')]: 5
			},
			{
				[itemID('Ancestral hat')]: 2
			},
			{
				[itemID('Ancestral robe top')]: 2
			},
			{
				[itemID('Ancestral robe bottom')]: 2
			}
		],
		levelRequirements: {
			prayer: 43
		},
		healAmountNeeded: 20 * 20,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackRanged, GearStat.AttackMagic],
		minimumGearRequirements: {
			[GearSetupTypes.Mage]: {
				[GearStat.AttackMagic]: 50
			},
			[GearSetupTypes.Range]: {
				[GearStat.AttackRanged]: 47
			}
		},
		defaultAttackStyles: [SkillsEnum.Ranged, SkillsEnum.Magic],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength]
	},
	{
		id: Monsters.KalphiteQueen.id,
		name: Monsters.KalphiteQueen.name,
		aliases: Monsters.KalphiteQueen.aliases,
		timeToFinish: Time.Minute * 4,
		table: Monsters.KalphiteQueen,
		emoji: '<:Kalphite_princess_2nd_form:324127376915300352>',
		wildy: false,

		difficultyRating: 7,
		itemsRequired: deepResolveItems([
			"Verac's flail",
			"Verac's plateskirt",
			["Black d'hide body", "Karil's leathertop", 'Armadyl chestplate'],
			["Black d'hide chaps", "karil's leatherskirt", 'Armadyl chainskirt']
		]),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon warhammer')]: 10
			},
			{
				[itemID('Elder maul')]: 5
			}
		],
		levelRequirements: {
			prayer: 43
		},
		pohBoosts: {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 10,
				'Ornate rejuvenation pool': 10,
				'Ancient rejuvenation pool': 20
			}
		},
		defaultAttackStyles: [SkillsEnum.Strength],
		customMonsterHP: 510,
		combatXpMultiplier: 1.05
	},
	{
		id: Monsters.CorporealBeast.id,
		name: Monsters.CorporealBeast.name,
		aliases: Monsters.CorporealBeast.aliases,
		table: new SimpleMonster({
			id: 319,
			name: 'Corporeal Beast',
			table: CorporealBeastTable,
			aliases: ['corporeal beast', 'corp']
		}),
		timeToFinish: Time.Minute * 30,
		emoji: '<:Pet_dark_core:324127377347313674>',
		wildy: false,

		difficultyRating: 6,
		itemsRequired: resolveItems(['Zamorakian spear']),
		notifyDrops: resolveItems([
			'Spectral sigil',
			'Arcane sigil',
			'Elysian sigil',
			'Pet dark core',
			'Divine sigil',
			'Jar of spirits'
		]),
		qpRequired: 0,
		itemInBankBoosts: [{ [itemID('Dragon warhammer')]: 10 }, { [itemID('Bandos godsword')]: 5 }],
		groupKillable: true,
		respawnTime: 20_000,
		levelRequirements: {
			prayer: 43
		},
		uniques: bosses['Corp Beast'],
		pohBoosts: {
			pool: {
				'Rejuvenation pool': 50,
				'Fancy rejuvenation pool': 50,
				'Ornate rejuvenation pool': 50,
				'Ancient rejuvenation pool': 57
			}
		},
		defaultAttackStyles: [SkillsEnum.Attack],
		disallowedAttackStyles: [SkillsEnum.Magic, SkillsEnum.Ranged],
		combatXpMultiplier: 1.55
	},
	{
		id: Monsters.Cerberus.id,
		name: Monsters.Cerberus.name,
		aliases: Monsters.Cerberus.aliases,
		timeToFinish: Time.Minute * 2.65,
		table: Monsters.Cerberus,
		emoji: '<:Hellpuppy:324127376185491458>',
		wildy: false,

		difficultyRating: 7,
		itemsRequired: deepResolveItems([
			["Torag's platebody", "Dharok's platebody", 'Bandos chestplate'],
			["Torag's platelegs", "Dharok's platelegs", 'Bandos tassets'],
			['Zamorakian spear', 'Zamorakian hasta']
		]),
		qpRequired: 0,
		itemInBankBoosts: [
			{ [itemID('Spectral spirit shield')]: 10 },
			{
				[itemID('Bandos chestplate')]: 5,
				[itemID("Inquisitor's hauberk")]: 8
			},
			{
				[itemID('Bandos tassets')]: 5,
				[itemID("Inquisitor's plateskirt")]: 8
			},
			{
				[itemID('Arclight')]: 15,
				[itemID("Inquisitor's mace")]: 8
			}
		],
		levelRequirements: {
			prayer: 43,
			slayer: 91
		},
		slayerOnly: true,
		defaultAttackStyles: [SkillsEnum.Strength],
		combatXpMultiplier: 1.15,
		healAmountNeeded: 20 * 15
	}
];

export default killableBosses;
