import { Time } from 'e';
import { LootTable, Monsters } from 'oldschooljs';
import { MonsterAttribute } from 'oldschooljs/dist/meta/monsterData';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import { itemID } from 'oldschooljs/dist/util';

import { HighSeedPackTable } from '../../../../data/seedPackTables';
import { GearStat } from '../../../../gear';
import { SkillsEnum } from '../../../../skilling/types';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import { AbyssalDragonLootTable } from './AbyssalDragon';
import { CustomMonster } from './customMonsters';
import { NihilizLootTable } from './Nihiliz';
import { KrakenTable } from './SeaKraken';
import { TreebeardLootTable } from './Treebeard';

const SeaKraken: CustomMonster = {
	id: 53_466_534,
	name: 'Sea Kraken',
	aliases: ['sea kraken'],
	timeToFinish: Time.Minute * 17,
	table: KrakenTable,
	emoji: '',
	notifyDrops: resolveItems(['Fish sack', 'Fishing trophy', 'Pufferfish']),
	wildy: false,
	difficultyRating: 7,
	qpRequired: 0,
	healAmountNeeded: 20 * 20,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackMagic],
	minimumGearRequirements: {
		range: {
			[GearStat.DefenceMagic]: 150,
			[GearStat.AttackRanged]: 80
		}
	},
	groupKillable: true,
	respawnTime: Time.Second * 20,
	levelRequirements: {
		prayer: 43,
		ranged: 105,
		slayer: 101
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 10
		}
	},
	baseMonster: Monsters.CommanderZilyana
};

const Malygos: CustomMonster = {
	id: 707_070,
	name: 'Malygos',
	aliases: ['abyssal dragon', 'abyss drag', 'mally', 'maly', 'malygos'],
	timeToFinish: Time.Minute * 30,
	table: AbyssalDragonLootTable,
	emoji: '',
	wildy: true,
	difficultyRating: 9,
	qpRequired: 999,
	healAmountNeeded: 20 * 25,
	attackStyleToUse: GearStat.AttackSlash,
	attackStylesUsed: [GearStat.AttackStab, GearStat.AttackSlash, GearStat.AttackMagic, GearStat.AttackRanged],
	minimumGearRequirements: {
		melee: {
			[GearStat.AttackStab]: 100,
			[GearStat.DefenceStab]: 150,
			[GearStat.DefenceSlash]: 150,
			[GearStat.DefenceMagic]: -20,
			[GearStat.DefenceRanged]: 150
		}
	},
	itemInBankBoosts: [
		{
			[itemID('Saradomin godsword')]: 5
		},
		{
			[itemID('Dragon warhammer')]: 5
		},
		{
			[itemID('Bandos godsword')]: 5
		}
	],
	itemsRequired: deepResolveItems([['Anti-dragon shield', 'Abyssal cape']]),
	groupKillable: true,
	respawnTime: Time.Second * 20,
	levelRequirements: {
		prayer: 99,
		attack: 99,
		strength: 105,
		defence: 99
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 10
		}
	},
	uniques: resolveItems(['Abyssal thread', 'Abyssal cape', 'Ori', 'Dragon hunter lance']),
	notifyDrops: resolveItems(['Abyssal cape', 'Ori']),
	baseMonster: Monsters.Vorkath,
	customMonsterData: { attributes: [MonsterAttribute.Dragon, MonsterAttribute.Fiery] }
};

const Treebeard: CustomMonster = {
	id: 932_122,
	name: 'Treebeard',
	aliases: ['treebeard', 'tree'],
	timeToFinish: Time.Minute * 10,
	table: TreebeardLootTable,
	emoji: '',
	wildy: true,
	difficultyRating: 9,
	qpRequired: 100,
	healAmountNeeded: 20 * 30,
	attackStyleToUse: GearStat.AttackMagic,
	attackStylesUsed: [GearStat.AttackMagic],
	respawnTime: Time.Second * 40,
	minimumGearRequirements: {
		mage: {
			[GearStat.AttackMagic]: 30 + 10 + 10 + 6 + 6 + 22 + 6
		}
	},
	levelRequirements: {
		magic: 105,
		slayer: 101
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 10
		}
	},
	baseMonster: Monsters.Hespori
};

export const QueenBlackDragon: CustomMonster = {
	id: 192_195,
	name: 'Queen Black Dragon',
	aliases: ['Queen Black Dragon', 'qbd', 'qdb'],
	timeToFinish: Time.Minute * 45,
	table: new LootTable()
		.every('Royal dragon bones')
		.every('Royal dragonhide', [5, 7])
		.tertiary(2500, 'Queen black dragonling')
		.tertiary(500, 'Draconic visage')
		.tertiary(250, 'Royal dragon kiteshield')
		.tertiary(64, 'Dragonbone upgrade kit')
		.tertiary(37, 'Clue scroll (grandmaster)')
		.oneIn(
			18,
			new LootTable()
				.add('Royal torsion spring')
				.add('Royal sight')
				.add('Royal frame')
				.add('Royal bolt stabiliser')
		)
		.add('Rocktail', [4, 10])
		.add('Saradomin brew(2)', [4, 10])
		.add('Super restore(2)', [4, 10])
		.add(new LootTable().add('Adamantite stone spirit').add('Runite stone spirit'), [1, 3])
		.add('Uncut dragonstone', 5)
		.add(HighSeedPackTable)
		.tertiary(30, RareDropTable),
	qpRequired: 182,
	healAmountNeeded: 20 * 45,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackStab, GearStat.AttackSlash, GearStat.AttackMagic, GearStat.AttackRanged],
	disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Magic],
	minimumGearRequirements: {
		range: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: -37,
			attack_ranged: 78,
			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 100,
			defence_ranged: 142,
			melee_strength: 0,
			ranged_strength: 2,
			magic_damage: 0,
			prayer: 3
		}
	},
	itemsRequired: deepResolveItems([['Dragonfire shield', 'Dragonfire ward']]),
	respawnTime: Time.Second * 20,
	levelRequirements: {
		prayer: 70,
		defence: 80,
		ranged: 85
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 6
		}
	},
	notifyDrops: resolveItems(['Queen black dragonling']),
	baseMonster: Monsters.Vorkath,
	itemInBankBoosts: [
		{
			[itemID('Royal crossbow')]: 8
		}
	]
};

const Nihiliz: CustomMonster = {
	id: 708_080,
	name: 'Nihiliz',
	aliases: ['nihiliz', 'shadow nihil boss', 'mini nex', 'nihilist'],
	timeToFinish: Time.Minute * 16,
	table: NihilizLootTable,
	emoji: '',
	wildy: false,
	difficultyRating: 9,
	qpRequired: 1000,
	healAmountNeeded: 20 * 32,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab, GearStat.AttackSlash, GearStat.AttackMagic, GearStat.AttackRanged],
	minimumGearRequirements: {
		melee: {
			[GearStat.AttackStab]: 100,
			[GearStat.DefenceStab]: 150,
			[GearStat.DefenceSlash]: 150,
			[GearStat.DefenceMagic]: -20,
			[GearStat.DefenceRanged]: 150
		}
	},
	itemInBankBoosts: [
		{
			[itemID('Zaryte crossbow')]: 15,
			[itemID('Zaryte bow')]: 10
		},
		{
			[itemID('Drygore rapier')]: 15
		},
		{
			[itemID('Offhand drygore rapier')]: 10
		},
		{
			[itemID('Dragon warhammer')]: 5
		},
		{
			[itemID('Zaryte vambraces')]: 5
		}
	],
	groupKillable: false,
	hp: 800,
	respawnTime: Time.Second * 10,
	levelRequirements: {
		prayer: 95,
		attack: 99,
		strength: 105,
		magic: 105,
		defence: 99
	},
	pohBoosts: {
		pool: {
			'Fancy rejuvenation pool': 5,
			'Ornate rejuvenation pool': 10,
			'Ancient rejuvenation pool': 15
		}
	},
	uniques: resolveItems(['Nihil horn', 'Zaryte vambraces', 'Nihil shard', 'Nexling']),
	notifyDrops: resolveItems(['Nihil horn', 'Zaryte vambraces', 'Nexling']),
	baseMonster: Monsters.Hespori
};

export const customDemiBosses = {
	Treebeard,
	SeaKraken,
	Malygos,
	QueenBlackDragon,
	Nihiliz
};
