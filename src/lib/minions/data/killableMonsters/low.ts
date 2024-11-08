import { Time } from 'e';
import { Monsters } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { GearStat } from '../../../gear/types';
import itemID from '../../../util/itemID';
import type { KillableMonster } from '../../types';

const killableMonsters: KillableMonster[] = [
	{
		id: Monsters.Imp.id,
		name: Monsters.Imp.name,
		aliases: Monsters.Imp.aliases,
		timeToFinish: Time.Second * 13,
		table: Monsters.Imp,
		wildy: false,
		difficultyRating: 5,
		qpRequired: 0
	},
	{
		id: Monsters.Jogre.id,
		name: Monsters.Jogre.name,
		aliases: Monsters.Jogre.aliases,
		timeToFinish: Time.Second * 19.5,
		table: Monsters.Jogre,
		wildy: false,
		canCannon: true,
		cannonMulti: true,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 1.5,
		healAmountNeeded: 14,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Unicorn.id,
		name: Monsters.Unicorn.name,
		aliases: Monsters.Unicorn.aliases,
		timeToFinish: Time.Second * 15.5,
		table: Monsters.Unicorn,
		wildy: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 10,
		healAmountNeeded: 8,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.Goat.id,
		name: Monsters.Goat.name,
		aliases: Monsters.Goat.aliases,
		timeToFinish: Time.Second * 28.2,
		table: Monsters.Goat,
		wildy: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 30,
		healAmountNeeded: 10,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.TzHaarXil.id,
		name: Monsters.TzHaarXil.name,
		aliases: Monsters.TzHaarXil.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.TzHaarXil,
		wildy: false,
		difficultyRating: 2,
		qpRequired: 0,
		canBarrage: false,
		healAmountNeeded: 50,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.TzHaarMej.id,
		name: Monsters.TzHaarMej.name,
		aliases: Monsters.TzHaarMej.aliases,
		timeToFinish: Time.Second * 28,
		table: Monsters.TzHaarMej,
		wildy: false,
		difficultyRating: 2,
		qpRequired: 0,
		canBarrage: false,
		healAmountNeeded: 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.GiantFrog.id,
		name: Monsters.GiantFrog.name,
		aliases: Monsters.GiantFrog.aliases,
		timeToFinish: Time.Second * 35,
		table: Monsters.GiantFrog,
		healAmountNeeded: 30,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.JubblyBird.id,
		name: Monsters.JubblyBird.name,
		aliases: Monsters.JubblyBird.aliases,
		timeToFinish: Time.Second * 20,
		table: Monsters.JubblyBird,
		qpRequired: 10
	},
	{
		id: Monsters.ManiacalMonkey.id,
		name: Monsters.ManiacalMonkey.name,
		aliases: Monsters.ManiacalMonkey.aliases,
		timeToFinish: Time.Second * 8.4,
		table: Monsters.ManiacalMonkey,
		levelRequirements: {
			prayer: 74,
			hitpoints: 74
		},
		qpRequired: 175,
		wildy: false,
		difficultyRating: 4,
		canChinning: true,
		canBarrage: true,
		canCannon: true,
		cannonMulti: true,
		itemInBankBoosts: [
			{ [itemID('Necklace of anguish')]: 5, [itemID('Occult necklace')]: 5 },
			{
				[itemID('Twisted buckler')]: 5,
				[itemID('Kodai wand')]: 5
			},
			{
				[itemID('Pegasian boots')]: 5,
				[itemID('Eternal boots')]: 5
			},
			{
				[itemID('Void ranger helm')]: 5,
				[itemID('Ancestral hat')]: 5
			}
		],
		attackStyleToUse: GearStat.AttackRanged,
		defaultAttackStyles: [SkillsEnum.Ranged, SkillsEnum.Magic],
		disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength]
	},
	{
		id: Monsters.BloodReaver.id,
		name: Monsters.BloodReaver.name,
		aliases: Monsters.BloodReaver.aliases,
		timeToFinish: Time.Second * 25,
		table: Monsters.BloodReaver,
		wildy: false,
		difficultyRating: 3,
		qpRequired: 1,
		itemsRequired: resolveItems(['Frozen key']),
		healAmountNeeded: 30,
		attackStyleToUse: GearStat.AttackRanged,
		disallowedAttackStyles: [SkillsEnum.Magic],
		attackStylesUsed: [GearStat.AttackMagic],
		itemInBankBoosts: [
			{
				[itemID('Arclight')]: 10,
				[itemID('Emberlight')]: 15
			}
		]
	},
	{
		id: Monsters.Araxyte.id,
		name: Monsters.Araxyte.name,
		aliases: Monsters.Araxyte.aliases,
		timeToFinish: Time.Second * 6,
		table: Monsters.Araxyte,
		qpRequired: 1,
		healAmountNeeded: 40,
		attackStyleToUse: GearStat.AttackCrush,
		attackStylesUsed: [GearStat.AttackStab],
		levelRequirements: {
			slayer: 92
		},
		cannonMulti: true,
		canCannon: true,
		superior: Monsters.DreadbornAraxyte,
		canBarrage: true
	},
	{
		id: Monsters.Crab.id,
		name: Monsters.Crab.name,
		aliases: Monsters.Crab.aliases,
		timeToFinish: Time.Second * 28.2,
		table: Monsters.Crab,
		wildy: false,
		difficultyRating: 1,
		qpRequired: 0,
		respawnTime: Time.Second * 6,
		healAmountNeeded: 3,
		attackStyleToUse: GearStat.AttackCrush,
		attackStylesUsed: [GearStat.AttackCrush],
		itemsRequired: resolveItems(['Fishbowl helmet', 'Diving apparatus'])
	}
];

export default killableMonsters;
