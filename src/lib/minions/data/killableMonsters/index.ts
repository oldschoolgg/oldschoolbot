import { Time } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { ZALCANO_ID } from '../../../constants';
import { GearSetupTypes, GearStat } from '../../../gear/types';
import { SkillsEnum } from '../../../skilling/types';
import itemID from '../../../util/itemID';
import resolveItems from '../../../util/resolveItems';
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
		id: Monsters.Man.id,
		name: Monsters.Man.name,
		aliases: Monsters.Man.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Man,
		emoji: '🧍‍♂️',
		wildy: false,
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
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Sarachnis.id,
		name: Monsters.Sarachnis.name,
		aliases: Monsters.Sarachnis.aliases,
		timeToFinish: Time.Minute * 2.35,
		table: Monsters.Sarachnis,
		emoji: '<:Sraracha:608231007803670529>',
		wildy: false,
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
		uniques: resolveItems(['Sraracha', 'Jar of eyes', 'Giant egg sac(full)', 'Sarachnis cudgel']),
		healAmountNeeded: 9 * 20,
		attackStyleToUse: GearStat.AttackSlash,
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

		difficultyRating: 10,
		qpRequired: 205,
		levelRequirements: {
			prayer: 43
		},
		uniques: resolveItems(['Crystal grail']),
		healAmountNeeded: 400 * 20,
		attackStyleToUse: GearStat.AttackRanged,
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
	attackStyleToUse: GearStat.AttackSlash,
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
	{ name: 'Mimic', aliases: ['mimic'], id: 23_184, emoji: '<:Tangleroot:324127378978635778>' },
	{ name: 'Hespori', aliases: ['hespori'], id: 8583, emoji: '<:Casket:365003978678730772>' }
];
