import { Bank, Monsters } from 'oldschooljs';

import { Time, ZALCANO_ID } from '../../../constants';
import { GearSetupTypes, GearStat } from '../../../gear/types';
import { SkillsEnum } from '../../../skilling/types';
import itemID from '../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../util/resolveItems';
import { KillableMonster } from '../../types';
import { NIGHTMARES_HP } from './../../../constants';
import bosses from './bosses';
import { chaeldarMonsters } from './chaeldarMonsters';
import { konarMonsters } from './konarMonsters';
import { krystiliaMonsters } from './krystiliaMonsters';
import low from './low';
import { mazchnaMonsters } from './mazchnaMonsters';
import { nieveMonsters } from './nieveMonsters';
import { turaelMonsters } from './turaelMonsters';
import { vannakaMonsters } from './vannakaMonsters';

const killableMonsters: KillableMonster[] = [
	...bosses,
	...chaeldarMonsters,
	...konarMonsters,
	...krystiliaMonsters,
	...mazchnaMonsters,
	...nieveMonsters,
	...turaelMonsters,
	...vannakaMonsters,
	...low,
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
		itemInBankBoosts: [
			{ [itemID('Barrows gloves')]: 2 },
			{ [itemID("Iban's staff")]: 5 },
			{ [itemID('Strange old lockpick')]: 7 }
		],
		levelRequirements: {
			prayer: 43
		},
		pohBoosts: {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 10,
				'Ornate rejuvenation pool': 10
			}
		},
		defaultAttackStyles: [SkillsEnum.Attack, SkillsEnum.Magic, SkillsEnum.Ranged],
		customMonsterHP: 600,
		combatXpMultiplier: 1.09
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
		combatXpMultiplier: 1.3
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
		combatXpMultiplier: 1.3
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
		qpRequired: 0,
		defaultAttackStyles: [SkillsEnum.Attack]
	},
	{
		id: Monsters.Guard.id,
		name: Monsters.Guard.name,
		aliases: Monsters.Guard.aliases,
		timeToFinish: Time.Second * 7.4,
		table: Monsters.Guard,

		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true
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
	/*
	{
		id: Monsters.Goblin.id,
		name: Monsters.Goblin.name,
		aliases: Monsters.Goblin.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Goblin,

		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		notifyDrops: resolveItems(['Goblin champion scroll']),
		qpRequired: 0
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

		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.BlueDragon.id,
		name: Monsters.BlueDragon.name,
		aliases: Monsters.BlueDragon.aliases,
		timeToFinish: Time.Second * 40,
		table: Monsters.BlueDragon,

		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		itemsRequired: resolveItems(['Anti-dragon shield']),
		qpRequired: 0,
		itemInBankBoosts: [{ [itemID('Zamorakian spear')]: 10 }],

		combatXpMultiplier: 1.025
	},
	{
		id: Monsters.Ankou.id,
		name: Monsters.Ankou.name,
		aliases: Monsters.Ankou.aliases,
		timeToFinish: Time.Second * 15,
		table: Monsters.Ankou,
		existsInCatacombs: true,
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

		wildy: false,
		canBeKilled: false,
		difficultyRating: 0,
		qpRequired: 0
	},

	 */
	{
		id: Monsters.Sarachnis.id,
		name: Monsters.Sarachnis.name,
		aliases: Monsters.Sarachnis.aliases,
		timeToFinish: Time.Minute * 2.35,
		table: Monsters.Sarachnis,
		emoji: '<:Sraracha:608231007803670529>',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 5,
		notifyDrops: resolveItems(['Sraracha', 'Jar of eyes']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon claws')]: 5
			}
		],
		levelRequirements: {
			prayer: 43
		},
		uniques: resolveItems([
			'Sraracha',
			'Jar of eyes',
			'Giant egg sac(full)',
			'Sarachnis cudgel'
		]),
		healAmountNeeded: 9 * 20,
		attackStyleToUse: GearSetupTypes.Melee,
		attackStylesUsed: [GearStat.AttackStab, GearStat.AttackRanged],
		minimumGearRequirements: {
			[GearSetupTypes.Melee]: {
				[GearStat.DefenceRanged]: 57 + 120,
				[GearStat.DefenceStab]: 47 + 26,
				[GearStat.AttackCrush]: 65
			}
		}
	},
	{
		id: Monsters.PriffRabbit.id,
		name: Monsters.PriffRabbit.name,
		aliases: Monsters.PriffRabbit.aliases,
		timeToFinish: Time.Hour,
		table: Monsters.PriffRabbit,
		emoji: '',
		wildy: false,
		canBeKilled: true,
		difficultyRating: 10,
		qpRequired: 205,
		levelRequirements: {
			prayer: 43
		},
		uniques: resolveItems(['Crystal grail']),
		healAmountNeeded: 400 * 20,
		attackStyleToUse: GearSetupTypes.Range,
		attackStylesUsed: [GearStat.AttackStab, GearStat.AttackRanged],
		minimumGearRequirements: {
			[GearSetupTypes.Range]: {
				[GearStat.AttackRanged]: 20 + 33 + 10 + 94 + 8
			}
		},
		itemCost: new Bank().add('Stamina potion(4)', 5).add('Ruby dragon bolts (e)', 100)
	}
];

export const NightmareMonster: KillableMonster = {
	id: 9415,
	name: 'The Nightmare',
	aliases: ['nightmare', 'the nightmare'],
	timeToFinish: Time.Minute * 25,
	table: Monsters.GeneralGraardor,
	emoji: '<:Little_nightmare:758149284952014928>',
	wildy: false,
	canBeKilled: false,
	difficultyRating: 7,
	notifyDrops: resolveItems([
		'Little nightmare',
		'Jar of dreams',
		'Nightmare staff',
		"Inquisitor's great helm",
		"Inquisitor's hauberk",
		"Inquisitor's plateskirt",
		"Inquisitor's mace",
		'Eldritch orb',
		'Harmonised orb',
		'Volatile orb'
	]),
	qpRequired: 10,
	groupKillable: true,
	respawnTime: Time.Minute * 2.5,
	levelRequirements: {
		prayer: 43
	},
	uniques: resolveItems([
		'Little nightmare',
		'Jar of dreams',
		'Nightmare staff',
		"Inquisitor's great helm",
		"Inquisitor's hauberk",
		"Inquisitor's plateskirt",
		"Inquisitor's mace",
		'Eldritch orb',
		'Harmonised orb',
		'Volatile orb'
	]),
	healAmountNeeded: 40 * 20,
	attackStyleToUse: GearSetupTypes.Melee,
	attackStylesUsed: [GearStat.AttackSlash],
	minimumGearRequirements: {
		[GearSetupTypes.Melee]: {
			[GearStat.DefenceSlash]: 150,
			[GearStat.AttackCrush]: 80
		}
	},
	customMonsterHP: NIGHTMARES_HP
};

export default killableMonsters;

export const effectiveMonsters = [
	...killableMonsters,
	NightmareMonster,
	{
		name: 'Zalcano',
		aliases: ['zalcano'],
		id: ZALCANO_ID,
		emoji: '<:Smolcano:604670895113633802>'
	},
	{ name: 'TzTok-Jad', aliases: ['jad'], id: 3127, emoji: '<:Tzrekjad:324127379188613121>' },
	{ name: 'Mimic', aliases: ['mimic'], id: 23184, emoji: '<:Tangleroot:324127378978635778>' },
	{ name: 'Hespori', aliases: ['hespori'], id: 8583, emoji: '<:Casket:365003978678730772>' }
];
