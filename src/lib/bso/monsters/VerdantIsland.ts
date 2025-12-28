import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank, itemID, LootTable, Monsters, RareDropTable, resolveItems } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

import { addStatsOfItemsTogether, Gear } from '@/lib/structures/Gear.js';

const IslandTable = new LootTable()
	.add('Ancient cap', [5, 15])
	.add('Colossal stem', [5, 15])
	.add('Brimstone spore', [5, 15])
	.add('Ignilace seed', [2, 8])
	.add('Ignilace', [3, 12])
	.add('Verdant log', [20, 50])
	.add('Ancient verdant log', [10, 30])
	.add('Living bark', [15, 40])
	.add('Crystalline ore', [20, 50])
	.add('Gem infused ore', [15, 40])
	.add('Dense crystal shard', [10, 30])
	.add('Diluted brimstone', [8, 25])
	.add('Myconid plank', [15, 35])
	.add('Crystalline plank', [15, 35])
	.add('Verdant plank', [20, 45])
	.add('Ancient verdant plank', [10, 25]);

const IslandGemTable = new LootTable()
	.add('Celestyte', [2, 6])
	.add('Starfire agate', [2, 6])
	.add('Verdantyte', [2, 6])
	.add('Oneiryte', [2, 6])
	.add('Firaxyte', [2, 6])
	.add('Gemstone bundle', [1, 3])
	.add('Gemstone satchel', 1)
	.add('Gemstone core', 1)
	.tertiary(500, 'Prismare');

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

const sentinelMinGear = new Gear();
sentinelMinGear.equip('Rune full helm');
sentinelMinGear.equip('Rune platebody');
sentinelMinGear.equip('Rune platelegs');
sentinelMinGear.equip('Rune gloves');
sentinelMinGear.equip('Rune boots');
sentinelMinGear.equip('Obsidian cape');
sentinelMinGear.equip('Amulet of strength');
sentinelMinGear.equip('Warrior ring');
sentinelMinGear.equip('Dragon scimitar');
sentinelMinGear.equip('Dragon defender');

const fungalMinGear = new Gear();
fungalMinGear.equip('Rune full helm');
fungalMinGear.equip('Rune platebody');
fungalMinGear.equip('Rune platelegs');
fungalMinGear.equip('Rune gloves');
fungalMinGear.equip('Rune boots');
fungalMinGear.equip('Obsidian cape');
fungalMinGear.equip('Amulet of strength');
fungalMinGear.equip('Warrior ring');
fungalMinGear.equip('Dragon scimitar');
fungalMinGear.equip('Dragon defender');

const elderMimicMinGear = new Gear();
elderMimicMinGear.equip('Dragon full helm');
elderMimicMinGear.equip('Dragon platebody');
elderMimicMinGear.equip('Dragon platelegs');
elderMimicMinGear.equip('Dragon gloves');
elderMimicMinGear.equip('Dragon boots');
elderMimicMinGear.equip('Fire cape');
elderMimicMinGear.equip('Amulet of fury');
elderMimicMinGear.equip('Berserker ring');
elderMimicMinGear.equip('Abyssal whip');
elderMimicMinGear.equip('Dragon defender');

export const CrystallineSentinel: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.CRYSTALLINE_SENTINEL,
	baseMonster: Monsters.AbyssalSire,
	name: 'Crystalline Sentinel',
	aliases: ['crystalline sentinel', 'sentinel', 'crystal sentinel'],
	timeToFinish: Time.Minute * 3.5,
	hp: 800,
	table: new LootTable()
		.every('Bones')
		
		.tertiary(150, 'Clue scroll (medium)')
		.tertiary(250, 'Clue scroll (hard)')
		.tertiary(1500, 'Sentinel core')
		.tertiary(25, RareDropTable)
		.tertiary(15, IslandTable)
		.tertiary(8, IslandGemTable)

		.add('Celestyte', [3, 8])
		.add('Oneiryte', [3, 8])
		.add('Starfire agate', [2, 6])
		.add('Crystalline ore', [25, 60])
		.add('Dense crystal shard', [15, 40])
		.add('Crystalline plank', [20, 50])
		.add('Gem infused ore', [20, 45])

		.add('Coal', [50, 120])
		.add('Mithril bar', [15, 35])
		.add('Adamantite bar', [10, 25])
		.add('Gold ore', [20, 50])
		.add('Cosmic rune', [50, 150])
		.add('Law rune', [30, 100])
		.add('Nature rune', [40, 120])
		.add('Uncut emerald', [5, 15])
		.add('Uncut ruby', [3, 10])
		.add('Uncut diamond', [2, 6]),

	difficultyRating: 2,
	qpRequired: 500,
	healAmountNeeded: 80 * 40,
	attackStyleToUse: GearStat.AttackSlash,
	attackStylesUsed: [GearStat.AttackSlash],
	levelRequirements: {
		hitpoints: 70,
		attack: 70,
		strength: 70,
		defence: 70
	},
	pohBoosts: {
		pool: {
			'Fancy rejuvenation pool': 3,
			'Ornate rejuvenation pool': 5,
			'Ancient rejuvenation pool': 7
		}
	},
	deathProps: {
		hardness: 0.3,
		steepness: 0.95,
		lowestDeathChance: 2,
		highestDeathChance: 15
	},
	minimumHealAmount: 12,
	allItems: resolveItems(['Sentinel core']),
	minimumGearRequirements: {
		melee: {
			...sentinelMinGear.stats,
			ranged_strength: 0,
			attack_ranged: 0
		}
	},
	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Dragon scimitar', 'Dragon defender']), [GearStat.AttackSlash])
	},
	itemCost: {
		itemCost: new Bank().add('Super combat potion(4)').add('Prayer potion(4)', 2),
		qtyPerKill: 1
	},
	setupsUsed: ['melee'],
	equippedItemBoosts: [
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 10,
					itemID: itemID('Abyssal whip')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 8,
					itemID: itemID('Saradomin sword')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 6,
					itemID: itemID('Dragon defender')
				}
			]
		}
	]
};

export const FungalBehemoth: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.FUNGAL_BEHEMOTH,
	baseMonster: Monsters.AbyssalSire,
	name: 'Fungal Behemoth',
	aliases: ['fungal behemoth', 'fungal', 'behemoth'],
	timeToFinish: Time.Minute * 4.5,
	hp: 1200,
	table: new LootTable()
		.every('Bones')
		
		.tertiary(150, 'Clue scroll (medium)')
		.tertiary(250, 'Clue scroll (hard)')
		.tertiary(1500, 'Verdant heart')
		.tertiary(25, RareDropTable)

		.add('Grimy guam leaf', [20, 60])
		.add('Grimy marrentill', [18, 55])
		.add('Grimy tarromin', [16, 50])
		.add('Grimy harralander', [14, 45])
		.add('Grimy ranarr weed', [12, 40])
		.add('Grimy irit leaf', [10, 35])
		.add('Grimy avantoe', [8, 30])
		.add('Grimy kwuarm', [8, 25])
		.add('Grimy cadantine', [6, 20])
		.add('Grimy lantadyme', [5, 18])
		.add('Grimy dwarf weed', [4, 15])
		.add('Grimy torstol', [3, 12])

		.add('Eye of newt', [30, 80])
		.add("Red spiders' eggs", [20, 60])
		.add('Limpwurt root', [15, 45])
		.add('Snape grass', [20, 55])
		.add('White berries', [15, 40])
		.add('Dragon scale dust', [10, 30])
		.add('Wine of zamorak', [8, 25])
		.add('Potato cactus', [12, 35])
		.add('Mort myre fungus', [15, 40])
		.add('Crushed nest', [8, 22])

		.add('Prayer potion(4)', [5, 15])
		.add('Super combat potion(4)', [3, 10])
		.add('Super restore(4)', [4, 12])

		.add('Ranarr seed', [3, 8])
		.add('Snapdragon seed', [2, 6])
		.add('Torstol seed', [1, 4])
		.add('Ignilace seed', [2, 6]),

	difficultyRating: 3,
	qpRequired: 750,
	healAmountNeeded: 120 * 50,
	attackStyleToUse: GearStat.AttackSlash,
	attackStylesUsed: [GearStat.AttackSlash],
	levelRequirements: {
		hitpoints: 35,
		attack: 35,
		strength: 35,
		defence: 35
	},
	pohBoosts: {
		pool: {
			'Fancy rejuvenation pool': 3,
			'Ornate rejuvenation pool': 5,
			'Ancient rejuvenation pool': 7
		}
	},
	deathProps: {
		hardness: 0.35,
		steepness: 0.96,
		lowestDeathChance: 3,
		highestDeathChance: 18
	},
	minimumHealAmount: 14,
	allItems: resolveItems(['Verdant heart']),
	minimumGearRequirements: {
		melee: {
			...fungalMinGear.stats,
			ranged_strength: 0,
			attack_ranged: 0
		}
	},
	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Dragon scimitar', 'Dragon defender']), [GearStat.AttackSlash])
	},
	itemCost: {
		itemCost: new Bank().add('Super combat potion(4)').add('Prayer potion(4)', 3).add('Saradomin brew(4)', 2),
		qtyPerKill: 1
	},
	setupsUsed: ['melee'],
	equippedItemBoosts: [
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 10,
					itemID: itemID('Abyssal bludgeon')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 8,
					itemID: itemID('Zamorakian hasta')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 6,
					itemID: itemID('Dragon defender')
				}
			]
		}
	],
	// XP scaling function
	xpMultiplier: (user) => {
		const skills = user.skillsAsLevels;
		const avgCombatLevel = (skills.attack + skills.strength + skills.defence + skills.hitpoints + skills.magic + skills.ranged) / 6;
		
		// Base mult at 75 is 1.0 (full ~2.5m/h)
		// At 120, mult ~0.4 (reduces to ~1m/h)
		const levelDiff = Math.max(0, avgCombatLevel - 75);
		const scalingFactor = Math.max(0.4, 1.0 - (levelDiff * 0.013));
		
		return scalingFactor;
	}
};

export const ElderMimic: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.ELDER_MIMIC,
	baseMonster: Monsters.Mimic,
	name: 'Elder Mimic',
	aliases: ['elder mimic', 'elder'],
	timeToFinish: Time.Minute * 800,
	hp: 5000,
	table: new LootTable()
		.every('Elder mimic casket'),

	difficultyRating: 6,
	qpRequired: 1500,
	healAmountNeeded: 200 * 100,
	attackStyleToUse: GearStat.AttackSlash,
	attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackCrush, GearStat.AttackStab],
	levelRequirements: {
		hitpoints: 120,
		attack: 120,
		strength: 120,
		defence: 120,
		magic: 120,
		ranged: 120
	},
	deathProps: {
		hardness: 0,
		steepness: 0,
		lowestDeathChance: 0,
		highestDeathChance: 0
	},
	minimumHealAmount: 18,
	allItems: resolveItems(['Elder mimic casket']),
	minimumGearRequirements: {
		melee: {
			...orymMinGear.stats,
			ranged_strength: 0,
			attack_ranged: 0
		}
	},
	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Abyssal whip', 'Dragon defender']), [GearStat.AttackSlash])
	},
	itemCost: {
		itemCost: new Bank()
			.add('Clue scroll (Beginner)', 1)
			.add('Clue scroll (Easy)', 1)
			.add('Clue scroll (Medium)', 1)
			.add('Clue scroll (Hard)', 1)
			.add('Clue scroll (Elite)', 1)
			.add('Clue scroll (Master)', 1)
			.add('Clue scroll (Grandmaster)', 1)
			.add('Clue scroll (Elder)', 1)
			.add('Elder mimic casket (locked)', 1)
			.add('Coins', 5_000_000_000),
		qtyPerKill: 1
	},
	groupKillable: false,
	setupsUsed: ['melee'],
};

export const Orym: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.ORYM,
	baseMonster: Monsters.AbyssalSire,
	name: 'Orym',
	aliases: ['orym'],
	timeToFinish: Time.Minute * 40,
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
	allItems: resolveItems(['Forsaken tear', 'Sacrilegious flask', 'Orylin', 'Primordial heartstring', 'Primordial spine']),
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
	timeToFinish: Time.Minute * 40,
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
	allItems: resolveItems(['Celestial flame', 'Shattered pendant', 'Orylin', 'Primordial heartstring', 'Primordial spine']),
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

export const VerdantIslandMonsters = {
	CrystallineSentinel,
	FungalBehemoth,
	ElderMimic,
	Orym,
	Orrodil,
};