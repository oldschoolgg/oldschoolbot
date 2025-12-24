import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank, itemID, LootTable, Monsters, RareDropTable, resolveItems } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

import { addStatsOfItemsTogether, Gear } from '@/lib/structures/Gear.js';

const orymMinGear = new Gear();
orymMinGear.equip('Gorajan warrior helmet');
orymMinGear.equip('Gorajan warrior top');
orymMinGear.equip('Gorajan warrior legs');
orymMinGear.equip('Gorajan warrior gloves');
orymMinGear.equip('Gorajan warrior boots');
orymMinGear.equip('TzKal cape');
orymMinGear.equip("Brawler's hook necklace");
orymMinGear.equip('Ignis ring(i)');
orymMinGear.equip('Dragon hunter lance');
orymMinGear.equip('Avernic defender');

const orrodilMinGear = new Gear();
orrodilMinGear.equip('Gorajan warrior helmet');
orrodilMinGear.equip('Gorajan warrior top');
orrodilMinGear.equip('Gorajan warrior legs');
orrodilMinGear.equip('Gorajan warrior gloves');
orrodilMinGear.equip('Gorajan warrior boots');
orrodilMinGear.equip('TzKal cape');
orrodilMinGear.equip("Brawler's hook necklace");
orrodilMinGear.equip('Ignis ring(i)');
orrodilMinGear.equip('Dragon hunter lance');
orrodilMinGear.equip('Avernic defender');

export const Orym: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.ORYM,
	baseMonster: Monsters.AbyssalSire,
	name: 'Orym',
	aliases: ['orym'],
	timeToFinish: Time.Minute * 20,
	hp: 2500,

table: new LootTable()
	.every('Primordial Bones', [2, 5])
	.every('Primordial Scales', [12, 50])

	.tertiary(50, 'Clue scroll (grandmaster)')
	.tertiary(1000, 'Primordial heartstring')
	.tertiary(1000, 'Primordial spine')
	.tertiary(2000, 'Sacrilegious flask')
	.tertiary(2000, 'Forsaken tear')
	.tertiary(2500, 'Orylin')
	.tertiary(25, RareDropTable)

	.add('Anti-venom (4)', [20, 55])
	.add('Black dragonhide', [200, 400])
	.add('Blue dragonhide', [300, 500])
	.add('Red dragonhide', [250, 450])
	.add('Battlestaff', [250, 500])

	.add('Death rune', [2000, 5000])
	.add('Blood rune', [2000, 5000])

	.add('Bronze bar', [250, 300])
	.add('Coal', [100, 250])
	.add('Iron arrow', [100, 500])
	.add('Bronze arrow', [100, 500])

	.add('Calcite', [50, 150])
	.add('Pyrophosphite', [50, 150])
	.add('Ashes', [50, 150])

	.add('Iron bar', [250, 300])
	.add('Iron ore', [250, 300])
	.add('Rune javelin', [250, 300])

	.add('Dragon dart tip', [300, 350])
	.add('Dragon arrowtips', [375, 425])
	.add('Dragon bolts (unf)', [375, 425])
	.add('Runite bolts (unf)', [450, 575])

	.add('Grimy torstol', [25, 60])
	.add('Grimy dwarf weed', [30, 75])
	.add('Grimy lantadyme', [35, 90])
	.add('Ignilace', [3, 20])
	.add('Ignilace seed', [1, 3]),


	difficultyRating: 5,
	qpRequired: 2500,
	healAmountNeeded: 350 * 200,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab],
	levelRequirements: {
		hitpoints: 120,
		attack: 115,
		strength: 115,
		defence: 115,
		magic: 115,
		ranged: 115,
		slayer: 115
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.4,
		steepness: 0.999,
		lowestDeathChance: 5,
		highestDeathChance: 40
	},
	minimumHealAmount: 22,
	allItems: resolveItems(["Forsaken tear", "Sacrilegious flask", "Orylin", "Primordial heartstring", "Primordial spine"]),
	minimumGearRequirements: {
		melee: {
			...orymMinGear.stats,
			ranged_strength: 0,
			attack_ranged: 0
		}
	},
	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Dragon hunter lance', 'Avernic defender']), [GearStat.AttackStab])
	},
	itemCost: {
		itemCost: new Bank().add('Super combat potion(4)').add('Heat res. brew', 3).add('Heat res. restore').add('Enhanced stamina potion'),
		qtyPerKill: 1
	},
	tameCantKill: true,
	itemsRequired: resolveItems(["Combatant's cape"]),
	customRequirement: async user => {
		const tames = await user.fetchTames();
		const hasMaxedIgne = tames.some(tame => tame.isMaxedIgneTame());
		if (hasMaxedIgne) return null;
		return 'You need to have a maxed Igne Tame (best gear, all fed items) to fight Orym.';
	},
	setupsUsed: ['melee'],
	equippedItemBoosts: [
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 25,
					itemID: itemID('Dragonbane glaive')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 15,
					itemID: itemID('Dragonbane aegis')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 7,
					itemID: itemID('Searcrown band')
				}
			]
		}
	]
};

export const Orrodil: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.ORRODIL,
	baseMonster: Monsters.AbyssalSire,
	name: 'Orrodil',
	aliases: ['orrodil'],
	timeToFinish: Time.Minute * 20,
	hp: 2500,
	table: new LootTable()
		.every('Primordial Bones', [2, 5])
		.every('Primordial Scales', [12, 50])

		.tertiary(75, 'Elder scroll piece')
		.tertiary(1000, 'Primordial heartstring')
		.tertiary(1000, 'Primordial spine')
		.tertiary(2000, 'Shattered pendant')
		.tertiary(2000, 'Celestial flame')
		.tertiary(2500, 'Orrodin')
		.tertiary(25, RareDropTable)

		.add('Enhanced super restore', [20, 50])
		.add('Enhanced saradomin brew', [20, 50])

		.add('Black dragonhide', [200, 400])
		.add('Blue dragonhide', [300, 500])
		.add('Red dragonhide', [250, 450])
		.add('Battlestaff', [250, 500])

		.add('Death rune', [2000, 5000])
		.add('Blood rune', [2000, 5000])
		.add('Elder rune', [100, 250])

		.add('Bronze bar', [250, 300])
		.add('Coal', [100, 250])
		.add('Iron arrow', [100, 500])
		.add('Bronze arrow', [100, 500])

		.add('Calcite', [50, 150])
		.add('Pyrophosphite', [50, 150])
		.add('Ashes', [50, 150])

		.add('Iron bar', [250, 300])
		.add('Iron ore', [250, 300])
		.add('Rune javelin', [250, 300])

		.add('Dragon dart tip', [300, 350])
		.add('Dragon arrowtips', [375, 425])
		.add('Dragon bolts (unf)', [375, 425])
		.add('Runite bolts (unf)', [450, 575])

		.add('Grimy torstol', [40, 100])
		.add('Grimy dwarf weed', [50, 125])
		.add('Grimy lantadyme', [60, 150])

		.add('Uncut zenyte', 1)
		.add('Uncut onyx', [3, 5])

		.add('Mahogany plank', [250, 350]),


	qpRequired: 2500,
	healAmountNeeded: 250 * 200,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab],
	levelRequirements: {
		hitpoints: 100,
		attack: 100,
		strength: 100,
		defence: 100,
		magic: 100,
		ranged: 100,
		slayer: 100
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.4,
		steepness: 0.999,
		lowestDeathChance: 5,
		highestDeathChance: 40
	},
	minimumHealAmount: 22,
	allItems: resolveItems(["Celestial flame", "Shattered pendant", "Orylin", "Primordial heartstring", "Primordial spine"]),
	minimumGearRequirements: {
		melee: {
			...orrodilMinGear.stats,
			ranged_strength: 0,
			attack_ranged: 0
		}
	},
	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Dragon hunter lance', 'Avernic defender']), [GearStat.AttackStab])
	},
	itemCost: {
		itemCost: new Bank()
			.add('Super combat potion(4)')
			.add('Enhanced saradomin brew', 3)
			.add('Enhanced super restore')
			.add('Enhanced stamina potion'),
		qtyPerKill: 1
	},
	tameCantKill: true,
	itemsRequired: resolveItems(["Combatant's cape"]),
	customRequirement: async user => {
		const tames = await user.fetchTames();
		const hasMaxedIgne = tames.some(tame => tame.isMaxedIgneTame());
		if (hasMaxedIgne) return null;
		return 'You need to have a maxed Igne Tame (best gear, all fed items) to fight Orrodil.';
	},
	setupsUsed: ['melee'],
	equippedItemBoosts: [
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 25,
					itemID: itemID('Dragonbane glaive')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 15,
					itemID: itemID('Dragonbane aegis')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 7,
					itemID: itemID('Searcrown band')
				}
			]
		}
	]
};

export const OrymOrrodilMonsters = {
	Orym,
	Orrodil
};
