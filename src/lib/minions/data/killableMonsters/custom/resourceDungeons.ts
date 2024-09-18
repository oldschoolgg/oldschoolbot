import { Time } from 'e';
import { Bank, LootTable, Monsters } from 'oldschooljs';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import { itemID, itemTupleToTable } from 'oldschooljs/dist/util';

import { HighSeedPackTable, LowSeedPackTable, MediumSeedPackTable } from '../../../../data/seedPackTables';
import { GearStat } from '../../../../gear';
import { lowRuneHighAdamantTable, runeWeaponTable } from '../../../../simulation/sharedTables';
import { SkillsEnum } from '../../../../skilling/types';
import resolveItems from '../../../../util/resolveItems';
import { GrimyHerbTable } from './Treebeard';
import type { CustomMonster } from './customMonsters';

function neemCost(extraCost?: Bank) {
	const cost = new Bank().add('Neem oil', 1);
	if (extraCost) cost.add(extraCost);
	return {
		itemCost: cost,
		qtyPerKill: 0.3
	};
}

const FrostDragon: CustomMonster = {
	id: 345_232,
	baseMonster: Monsters.LavaDragon,
	name: 'Frost Dragon',
	aliases: ['frost dragon', 'fd'],
	timeToFinish: Time.Minute * 6,
	hp: 330,
	table: new LootTable()
		.every('Frost dragon bones')
		.tertiary(10_000, 'Draconic visage')
		.tertiary(290, 'Clue scroll (grandmaster)')
		.tertiary(33, RareDropTable)
		.add('Rune arrow', [12, 36])
		.add('Water talisman')
		.add('Adamant platelegs', [2, 5])
		.add('Adamant platebody', [2, 5])
		.add(runeWeaponTable, [2, 5])
		.add('Death rune', [10, 15])
		.add('Law rune', [10, 15])
		.add('Pure essence', 50)
		.add(GrimyHerbTable)
		.add('Coins', [200, 1337])
		.add('Water orb')
		.add('Limpwurt root', [3, 5])
		.add('Mahogany logs', [3, 5])
		.add('Adamantite stone spirit', 3),
	wildy: false,
	notifyDrops: resolveItems([]),
	difficultyRating: 5,
	itemsRequired: resolveItems([]),
	qpRequired: 60,
	healAmountNeeded: 20 * 14,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 85,
		prayer: 70
	},
	itemInBankBoosts: [
		{
			[itemID('TzKal cape')]: 8,
			[itemID('Infernal cape')]: 4,
			[itemID('Fire cape')]: 2
		}
	],
	itemCost: {
		itemCost: new Bank().add('Prayer potion(4)', 1),
		qtyPerKill: 0.2
	},
	pohBoosts: {
		pool: {
			'Rejuvenation pool': 3,
			'Fancy rejuvenation pool': 3,
			'Ornate rejuvenation pool': 3,
			'Ancient rejuvenation pool': 5
		}
	}
};

const RumPumpedCrab: CustomMonster = {
	id: 918_501,
	baseMonster: Monsters.BrineRat,
	name: 'Rum-pumped crab',
	aliases: ['rpc', 'rum crab', 'rum pumped crab'],
	timeToFinish: Time.Second * 40,
	hp: 35,
	table: new LootTable()
		.tertiary(1200, 'Brackish blade')
		.tertiary(64, RareDropTable)
		.add(lowRuneHighAdamantTable)
		.add(GrimyHerbTable)
		.add(MediumSeedPackTable)
		.add(new LootTable().add('Super attack(1)').add('Super strength(1)').add('Super defence(1)'))
		.add('Gold stone spirit'),
	itemsRequired: resolveItems(['Fishbowl helmet', 'Diving apparatus']),
	healAmountNeeded: 20 * 2,
	attackStyleToUse: GearStat.AttackCrush,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 50
	}
};

const FungalRodent: CustomMonster = {
	id: 669_279,
	baseMonster: Monsters.BrineRat,
	name: 'Fungal Rodent',
	aliases: ['fungal rodent'],
	timeToFinish: Time.Second * 80,
	hp: 85,
	table: new LootTable()
		.tertiary(320, 'Mycelium visor web')
		.add('Swamp tar', [3, 6])
		.add('Swamp toad')
		.add('Chaos rune', [1, 3])
		.add('Polypore spore')
		.add('Limpwurt root')
		.add('Grifolic flake', [1, 4])
		.add('Neem drupe', [1, 2])
		.add(GrimyHerbTable),
	healAmountNeeded: 20 * 2,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 82
	},
	itemCost: neemCost(),
	disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Ranged]
};

const InfestedAxe: CustomMonster = {
	id: 194_820,
	baseMonster: Monsters.AbyssalDemon,
	name: 'Infested axe',
	aliases: ['infested axe'],
	timeToFinish: Time.Second * 80,
	hp: 85,
	table: new LootTable()
		.add(GrimyHerbTable)
		.oneIn(264, 'Morchella mushroom spore')
		.add('Chaos rune', [6, 16])
		.add('Neem drupe', [1, 2])
		.add('Potato cactus')
		.add('Swamp tar', [3, 11])
		.add('Polypore spore', [1, 80])
		.add('Grifolic flake', [1, 12])
		.add('Gorajian mushroom'),
	healAmountNeeded: 20 * 2,
	attackStyleToUse: GearStat.AttackMagic,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 82
	},
	itemCost: neemCost(),
	disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Ranged]
};

const FungalMage: CustomMonster = {
	id: 341_749,
	baseMonster: Monsters.AbyssalDemon,
	name: 'Fungal mage',
	aliases: ['fungal mage'],
	timeToFinish: Time.Second * 80,
	hp: 155,
	table: new LootTable()
		.tertiary(159, 'Mycelium poncho web')
		.tertiary(90, 'Clue scroll (hard)')
		.add(GrimyHerbTable)
		.add('Neem drupe', [1, 3])
		.add(MediumSeedPackTable)
		.add(HighSeedPackTable)
		.add('Polypore spore', [1, 100])
		.add('Grifolic flake', [1, 25])
		.add('Snape grass', 4)
		.oneIn(64, 'Tombshroom spore')
		.add('Limpwurt root', 5)
		.add('Gorajian mushroom')
		.add('Potato cactus', 8),
	healAmountNeeded: 20 * 5,
	attackStyleToUse: GearStat.AttackMagic,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 82
	},
	itemCost: neemCost(),
	disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Ranged]
};

const Grifolaroo: CustomMonster = {
	id: 819_581,
	baseMonster: Monsters.DarkBeast,
	name: 'Grifolaroo',
	aliases: ['grifolaroo'],
	timeToFinish: Time.Minute * 3,
	hp: 155,
	table: new LootTable()
		.every('Neem drupe', [1, 3])
		.every('Bones')
		.tertiary(200, 'Clue scroll (master)')
		.tertiary(230, new LootTable().add('Grifolic gloves').add('Grifolic orb'))
		.oneIn(64, 'Morchella mushroom spore')
		.add(
			itemTupleToTable([
				['Chaos rune', [5, 60]],
				['Death rune', [5, 60]]
			])
		)
		.add(LowSeedPackTable)
		.add(MediumSeedPackTable)
		.add('Polypore spore', [1, 500])
		.add('Gorajian mushroom', 3)
		.add('Grifolic flake', [1, 112])
		.add('Snape grass', [10, 20]),
	healAmountNeeded: 20 * 5,
	attackStyleToUse: GearStat.AttackMagic,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 82,
		slayer: 82
	},
	itemCost: neemCost(),
	disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Ranged]
};

const Grifolapine: CustomMonster = {
	id: 721_932,
	baseMonster: Monsters.DarkBeast,
	name: 'Grifolapine',
	aliases: ['grifolapine'],
	timeToFinish: Time.Minute * 4,
	hp: 195,
	table: new LootTable()
		.tertiary(450, 'Clue scroll (grandmaster)')
		.tertiary(80, 'Mycelium leggings web')
		.every('Neem drupe', [1, 3])
		.every('Bones')
		.add(GrimyHerbTable)
		.add(MediumSeedPackTable)
		.add('Polypore spore', [1, 300])
		.add('Grifolic flake', [1, 100])
		.add('Gorajian mushroom', 5)
		.oneIn(64, 'Tombshroom spore')
		.add('Snape grass', [5, 25]),
	healAmountNeeded: 20 * 9,
	attackStyleToUse: GearStat.AttackMagic,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 82,
		slayer: 88
	},
	itemCost: neemCost(),
	disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Ranged]
};

const GanodermicRunt: CustomMonster = {
	id: 129_129,
	baseMonster: Monsters.DarkBeast,
	name: 'Ganodermic Runt',
	aliases: ['ganodermic runt'],
	timeToFinish: Time.Minute * 6,
	hp: 295,
	table: new LootTable()
		.every('Neem drupe', [1, 3])
		.every('Bones')
		.tertiary(360, 'Clue scroll (grandmaster)')
		.tertiary(230, new LootTable().add('Ganodermic gloves').add('Ganodermic boots'))
		.add(
			itemTupleToTable([
				['Blood rune', [5, 60]],
				['Death rune', [5, 60]]
			])
		)
		.oneIn(64, 'Morchella mushroom spore')
		.add(HighSeedPackTable)
		.add('Gorajian mushroom', 5)
		.add('Polypore spore', [1, 625])
		.add('Flax', 20)
		.add('Ganodermic flake', [1, 60]),
	healAmountNeeded: 20 * 13,
	attackStyleToUse: GearStat.AttackMagic,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 82,
		slayer: 95
	},
	itemCost: neemCost(new Bank().add('Polypore spore', 120).add('Astral rune', 52)),
	disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Ranged]
};

const GanodermicBeast: CustomMonster = {
	id: 194_825,
	baseMonster: Monsters.DarkBeast,
	name: 'Ganodermic Beast',
	aliases: ['ganodermic beast'],
	timeToFinish: Time.Minute * 10,
	hp: 395,
	table: new LootTable()
		.every('Neem drupe', [1, 4])
		.every('Bones')
		.tertiary(5000, 'Curved bone')
		.tertiary(400, 'Long bone')
		.tertiary(380, 'Clue scroll (grandmaster)')
		.tertiary(230, new LootTable().add('Ganodermic gloves').add('Ganodermic boots').add('Polypore stick'))
		.add(
			itemTupleToTable([
				['Blood rune', [5, 60]],
				['Death rune', [5, 60]]
			])
		)
		.add(HighSeedPackTable)
		.oneIn(64, 'Tombshroom spore')
		.add('Gorajian mushroom', 12)
		.add('Flax', 40)
		.add('Ganodermic flake', [1, 298])
		.add('Polypore spore', [1, 1252])
		.add(RareDropTable)
		.add('Coins', [1, 2932]),
	healAmountNeeded: 20 * 18,
	attackStyleToUse: GearStat.AttackMagic,
	attackStylesUsed: [GearStat.AttackMagic, GearStat.AttackRanged],
	levelRequirements: {
		dungeoneering: 82,
		slayer: 98
	},
	itemCost: neemCost(new Bank().add('Polypore spore', 150).add('Astral rune', 64)),
	disallowedAttackStyles: [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence, SkillsEnum.Ranged]
};

export const resourceDungeonMonsters = {
	FrostDragon,
	RumPumpedCrab,
	FungalRodent,
	InfestedAxe,
	FungalMage,
	Grifolaroo,
	Grifolapine,
	GanodermicRunt,
	GanodermicBeast
};
