import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import { SkillsEnum } from '../../../../skilling/types';
import itemID from '../../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';

const killableBosses: KillableMonster[] = [
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
		notifyDrops: resolveItems(['Callisto cub']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Barrows gloves')]: 2,
			[itemID('Berserker ring')]: 2
		},
		defaultAttackStyles: [SkillsEnum.Attack]
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
		notifyDrops: resolveItems(["Vet'ion jr.", 'Skeleton champion scroll']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Dragon warhammer')]: 3
		},
		defaultAttackStyles: [SkillsEnum.Attack]
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
		notifyDrops: resolveItems(['Venenatis spiderling']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Barrows gloves')]: 3
		},
		defaultAttackStyles: [SkillsEnum.Attack]
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
		itemsRequired: deepResolveItems([
			["Black d'hide body", "Karil's leathertop"],
			["Black d'hide chaps", "Karil's leatherskirt"]
		]),
		notifyDrops: resolveItems(['Pet chaos elemental']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Archers ring')]: 3,
			[itemID('Barrows gloves')]: 3
		},
		defaultAttackStyles: [SkillsEnum.Attack]
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
		notifyDrops: resolveItems(['Pet chaos elemental']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID("Karil's leathertop")]: 3,
			[itemID("Karil's leatherskirt")]: 3
		},
		defaultAttackStyles: [SkillsEnum.Ranged]
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
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Occult necklace')]: 10
		},
		defaultAttackStyles: [SkillsEnum.Magic]
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
		itemsRequired: deepResolveItems([
			'Anti-dragon shield',
			['Armadyl crossbow', 'Rune crossbow'],
			[
				"Black d'hide body",
				"Black d'hide body (g)",
				"Black d'hide body (t)",
				"Karil's leathertop"
			],
			[
				"Black d'hide chaps",
				"Black d'hide chaps (g)",
				"Black d'hide chaps (t)",
				"Karil's leatherskirt"
			]
		]),
		notifyDrops: resolveItems(['Prince black dragon', 'Draconic visage']),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Armadyl crossbow')]: 10
		},
		defaultAttackStyles: [SkillsEnum.Ranged]
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
		notifyDrops: resolveItems(["Scorpia's offspring"]),
		qpRequired: 0,
		itemInBankBoosts: {
			[itemID('Occult necklace')]: 10
		},
		defaultAttackStyles: [SkillsEnum.Magic]
	}
];

export default killableBosses;
