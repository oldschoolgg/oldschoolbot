import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank, itemID, LootTable, Monsters, RareDropTable, resolveItems } from 'oldschooljs';
import { GearStat } from '@oldschoolgg/gear';

import { MUserClass } from '@/lib/user/MUser.js';
import { addStatsOfItemsTogether, Gear } from '@/lib/structures/Gear.js';

export const IslandTable = new LootTable()
	.add('Ancient cap', [5, 15])
	.add('Colossal stem', [5, 15])
	.add('Brimstone spore', [5, 15])
	.add('Ignilace seed', [2, 8])
	.add('Ignilace', [3, 12])
	.add('Verdant logs', [20, 500])
	.add('Ancient verdant logs', [10, 300])
	.add('Living bark', [15, 400])
	.add('Crystalline ore', [20, 500])
	.add('Gem infused ore', [15, 400])
	.add('Dense crystal shard', [10, 300])
	.add('Diluted brimstone', [8, 25])
	.add('Myconid plank', [15, 350])
	.add('Crystalline plank', [15, 350])
	.add('Verdant plank', [20, 450])
	.add('Ancient verdant plank', [10, 250]);

export const IslandGemTable = new LootTable()
	.add('Celestyte', [2, 6])
	.add('Starfire agate', [2, 6])
	.add('Verdantyte', [2, 6])
	.add('Oneiryte', [2, 6])
	.add('Firaxyte', [2, 6])
	.tertiary(25, 'Gemstone bundle')
	.tertiary(75, 'Gemstone satchel')
	.tertiary(150, 'Gemstone core')
	.tertiary(500, 'Prismare');

export const IslandTable3x = new LootTable().every(IslandTable).every(IslandTable).every(IslandTable);

export const IslandTable5x = new LootTable()
	.every(IslandTable)
	.every(IslandTable)
	.every(IslandTable)
	.every(IslandTable)
	.every(IslandTable);

export const IslandGemTable3x = new LootTable().every(IslandGemTable).every(IslandGemTable).every(IslandGemTable);

export const IslandGemTable5x = new LootTable()
	.every(IslandGemTable)
	.every(IslandGemTable)
	.every(IslandGemTable)
	.every(IslandGemTable)
	.every(IslandGemTable);

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
		.tertiary(50, IslandTable3x)
		.tertiary(25, IslandGemTable3x)
		.tertiary(100, IslandTable5x)
		.tertiary(50, IslandGemTable5x)

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
	setupsUsed: ['melee', 'range'],
	equippedItemBoosts: [
		{
			gearSetup: 'range',
			items: [
				{
					boostPercent: 25,
					itemID: itemID('Vitrolic curse')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 15,
					itemID: itemID('Starfire bow')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 10,
					itemID: itemID("Brawler's hook necklace")
				}
			]
		}
	],
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
		.tertiary(150, 'Clue scroll (medium)')
		.tertiary(250, 'Clue scroll (hard)')
		.tertiary(1500, 'Verdant heart')
		.tertiary(25, RareDropTable)
		.tertiary(15, IslandTable)
		.tertiary(8, IslandGemTable)
		.tertiary(50, IslandTable3x)
		.tertiary(25, IslandGemTable3x)
		.tertiary(100, IslandTable5x)
		.tertiary(50, IslandGemTable5x)

		.add('Verdantyte', [4, 10])
		.add('Starfire agate', [2, 6])
		.add('Oneiryte', [2, 5])

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

		.add('Ancient cap', [8, 20])
		.add('Colossal stem', [8, 20])
		.add('Brimstone spore', [8, 20])
		.add('Verdant logs', [25, 60])
		.add('Ancient verdant logs', [15, 40])
		.add('Living bark', [20, 50])

		.add('Ranarr seed', [3, 8])
		.add('Snapdragon seed', [2, 6])
		.add('Torstol seed', [1, 4])
		.add('Ignilace seed', [1, 2]),
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
		hardness: 0.01,
		steepness: 0.01,
		lowestDeathChance: 1,
		highestDeathChance: 1
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
	setupsUsed: ['melee', 'range'],
	equippedItemBoosts: [
		{
			gearSetup: 'range',
			items: [
				{
					boostPercent: 25,
					itemID: itemID('Vitrolic curse')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 15,
					itemID: itemID('Starfire bow')
				}
			]
		},
		{
			gearSetup: 'melee',
			items: [
				{
					boostPercent: 10,
					itemID: itemID("Brawler's hook necklace")
				}
			]
		}
	],
	combatXpMultiplier: (user: MUserClass, attackStyles?: string[]) => {
		const skills = user.skillsAsLevels;

		let combatLevel = 0;
		const styleTypes = (attackStyles || []).map(s => s.toLowerCase());

		if (styleTypes.some(s => ['attack', 'strength', 'defence'].includes(s))) {
			combatLevel = (skills.attack + skills.strength + skills.defence + skills.hitpoints) / 4;
		} else if (styleTypes.includes('ranged')) {
			combatLevel = (skills.ranged + skills.defence + skills.hitpoints) / 3;
		} else if (styleTypes.includes('magic')) {
			combatLevel = (skills.magic + skills.defence + skills.hitpoints) / 3;
		} else {
			combatLevel =
				(skills.attack + skills.strength + skills.defence + skills.hitpoints + skills.magic + skills.ranged) /
				6;
		}

		const clampedLevel = Math.min(90, Math.max(75, combatLevel));

		const t = (clampedLevel - 75) / 15;
		const exponentialT = Math.pow(t, 2);
		const scalingFactor = 8.5 - exponentialT * 5.1;

		return scalingFactor;
	}
};

export const ElderMimic: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.ELDER_MIMIC,
	baseMonster: Monsters.AbyssalSire,
	name: 'Elder Mimic',
	aliases: ['elder mimic', 'elder'],
	timeToFinish: Time.Minute * 400,
	hp: 2000,
	table: new LootTable().every('Elder mimic casket'),

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
			.add('Elder mimic casket (locked)', 1),
		qtyPerKill: 1
	},
	groupKillable: false,
	setupsUsed: ['melee']
};

export const Orym: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.ORYM,
	baseMonster: Monsters.AbyssalSire,
	name: 'Orym',
	aliases: ['orym'],
	timeToFinish: Time.Minute * 18,
	hp: 1800,
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
		.tertiary(5, IslandTable)
		.tertiary(5, IslandGemTable)
		.tertiary(25, IslandTable3x)
		.tertiary(25, IslandGemTable3x)
		.tertiary(50, IslandTable5x)
		.tertiary(50, IslandGemTable5x)

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
		.add('Ignilace', [5, 30])
		.add('Ignilace seed', [1, 10]),

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
	allItems: resolveItems([
		'Forsaken tear',
		'Sacrilegious flask',
		'Orylin',
		'Primordial heartstring',
		'Primordial spine'
	]),
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
		itemCost: new Bank()
			.add('Super combat potion(4)')
			.add('Heat res. brew', 3)
			.add('Heat res. restore')
			.add('Enhanced stamina potion'),
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
	timeToFinish: Time.Minute * 18,
	hp: 1800,
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
		.tertiary(5, IslandTable)
		.tertiary(5, IslandGemTable)
		.tertiary(25, IslandTable3x)
		.tertiary(25, IslandGemTable3x)
		.tertiary(50, IslandTable5x)
		.tertiary(50, IslandGemTable5x)

		.add('Enhanced super restore', [20, 50])
		.add('Enhanced saradomin brew', [20, 50])

		.add('Black dragonhide', [100, 400])
		.add('Blue dragonhide', [200, 500])
		.add('Red dragonhide', [150, 450])
		.add('Battlestaff', [100, 300])
		.add('Royal dragonhide', [50, 200])

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
	allItems: resolveItems([
		'Celestial flame',
		'Shattered pendant',
		'Orrodin',
		'Primordial heartstring',
		'Primordial spine'
	]),
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

export const BurningDominionTemplate: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.BURNING_DOMINION,
	baseMonster: Monsters.AbyssalSire,
	name: 'Burning Dominion',
	aliases: ['burning dominion', 'dominion', 'burning', 'orym and orrodil'],
	timeToFinish: Time.Minute * 20,
	hp: 5000,
	respawnTime: 0,
	difficultyRating: 9	,

	table: new LootTable()
		.every('Primordial Bones', [4, 10])
		.every('Primordial Scales', [24, 100])

		.tertiary(50, 'Clue scroll (grandmaster)')
		.tertiary(75, 'Elder scroll piece')

		.tertiary(500, 'Primordial heartstring')
		.tertiary(500, 'Primordial spine')

		.tertiary(1500, 'Sacrilegious flask')
		.tertiary(1500, 'Forsaken tear')
		.tertiary(2000, 'Orylin')

		.tertiary(1500, 'Shattered pendant')
		.tertiary(1500, 'Celestial flame')
		.tertiary(2000, 'Orrodin')

		.tertiary(20, RareDropTable)
		.tertiary(4, IslandTable)
		.tertiary(4, IslandGemTable)
		.tertiary(20, IslandTable3x)
		.tertiary(20, IslandGemTable3x)
		.tertiary(40, IslandTable5x)
		.tertiary(40, IslandGemTable5x)

		.add('Anti-venom (4)', [30, 75])
		.add('Enhanced super restore', [25, 60])
		.add('Enhanced saradomin brew', [25, 60])

		.add('Black dragonhide', [300, 800])
		.add('Blue dragonhide', [500, 1000])
		.add('Red dragonhide', [400, 900])
		.add('Royal dragonhide', [50, 200])
		.add('Battlestaff', [350, 800])

		.add('Death rune', [4000, 10000])
		.add('Blood rune', [4000, 10000])
		.add('Elder rune', [100, 250])

		.add('Bronze bar', [500, 600])
		.add('Coal', [200, 500])
		.add('Iron arrow', [200, 1000])
		.add('Bronze arrow', [200, 1000])

		.add('Calcite', [100, 300])
		.add('Pyrophosphite', [100, 300])
		.add('Ashes', [100, 300])

		.add('Iron bar', [500, 600])
		.add('Iron ore', [500, 600])
		.add('Rune javelin', [500, 600])

		.add('Dragon dart tip', [600, 700])
		.add('Dragon arrowtips', [750, 850])
		.add('Dragon bolts (unf)', [750, 850])
		.add('Runite bolts (unf)', [900, 1150])

		.add('Grimy torstol', [65, 160])
		.add('Grimy dwarf weed', [80, 200])
		.add('Grimy lantadyme', [95, 240])

		.add('Ignilace', [5, 30])
		.add('Ignilace seed', [1, 10])
		.add('Uncut zenyte', 1)
		.add('Uncut onyx', [3, 5])
		.add('Mahogany plank', [250, 350]),

	qpRequired: 2500,
	healAmountNeeded: 600 * 200,
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

	allItems: resolveItems([
		'Forsaken tear',
		'Sacrilegious flask',
		'Orylin',
		'Celestial flame',
		'Shattered pendant',
		'Orrodin',
		'Primordial heartstring',
		'Primordial spine'
	]),

	minimumGearRequirements: {
		melee: {
			...orymMinGear.stats,
			ranged_strength: 0,
			attack_ranged: 0
		}
	},

	minimumWeaponShieldStats: {
		melee: addStatsOfItemsTogether(resolveItems(['Dragonbane Glaive', 'Dragonbane Aegis']), [GearStat.AttackStab])
	},

	itemCost: {
		itemCost: new Bank()
			.add('Super combat potion(4)')
			.add('Heat res. brew', 3)
			.add('Heat res. restore')
			.add('Brimstone elixir', 3)
			.add('Enhanced stamina potion'),
		qtyPerKill: 1
	},

	tameCantKill: true,
	itemsRequired: resolveItems(["Combatant's cape"]),
	customRequirement: async user => {
		const tames = await user.fetchTames();
		const hasMaxedIgne = tames.some(tame => tame.isMaxedIgneTame());
		if (hasMaxedIgne) return null;
		return 'You need to have a maxed Igne Tame (best gear, all fed items) to fight Orym & Orrodil.';
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
	],
	groupKillable: true
};

export const VerdantIslandMonsters = {
	CrystallineSentinel,
	FungalBehemoth,
	ElderMimic,
	Orym,
	Orrodil,
	BurningDominion: BurningDominionTemplate
};
