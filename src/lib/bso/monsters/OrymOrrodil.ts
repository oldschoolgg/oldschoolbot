import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank, itemID, LootTable, Monsters, resolveItems } from 'oldschooljs';
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
orymMinGear.equip('Drygore rapier');
orymMinGear.equip('Offhand dragon claw');

const orrodilMinGear = new Gear();
orrodilMinGear.equip('Gorajan warrior helmet');
orrodilMinGear.equip('Gorajan warrior top');
orrodilMinGear.equip('Gorajan warrior legs');
orrodilMinGear.equip('Gorajan warrior gloves');
orrodilMinGear.equip('Gorajan warrior boots');
orrodilMinGear.equip('TzKal cape');
orrodilMinGear.equip("Brawler's hook necklace");
orrodilMinGear.equip('Ignis ring(i)');
orrodilMinGear.equip('Soulreaper axe');

export const Orym: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.ORYM,
	baseMonster: Monsters.AbyssalSire,
	name: 'Orym',
	aliases: ['orym'],
	timeToFinish: Time.Minute * 120,
	hp: 3330,
	table: new LootTable().every('Primordial bones', [10, 60]).every('Primordial scales', [10, 60]).tertiary(500, 'Primordial heartstring').tertiary(500, 'Primordial spine').tertiary(2000, 'Orylin').tertiary(500, 'Sacrilegious flask').tertiary(500, 'Forsaken tear'),
	difficultyRating: 5,
	qpRequired: 2500,
	healAmountNeeded: 350 * 200,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab],
	levelRequirements: {
		hitpoints: 120,
		attack: 110,
		strength: 110,
		defence: 110,
		magic: 110,
		ranged: 110,
		slayer: 110
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 5
		}
	},
	deathProps: {
		hardness: 0.8,
		steepness: 0.999,
		lowestDeathChance: 10,
		highestDeathChance: 80
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
		melee: addStatsOfItemsTogether(resolveItems(['Offhand dragon claw', 'Drygore rapier']), [GearStat.AttackStab])
	},
	itemCost: {
		itemCost: new Bank().add('Super combat potion(4)').add('Heat res. brew', 3).add('Heat res. restore'),
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
					boostPercent: 7,
					itemID: itemID('Offhand spidergore rapier')
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
	timeToFinish: Time.Minute * 100,
	hp: 3330,
	table: new LootTable().every('Primordial bones', [10, 60]).every('Primordial scales', [10, 60]).tertiary(500, 'Primordial heartstring').tertiary(500, 'Primordial spine').tertiary(2000, 'Orrodin').tertiary(500, 'Shattered pendant').tertiary(500, 'Celestial flame'),
	difficultyRating: 5,
	qpRequired: 1500,
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
		hardness: 0.5,
		steepness: 0.999,
		lowestDeathChance: 5,
		highestDeathChance: 65
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
		melee: addStatsOfItemsTogether(resolveItems(['Soulreaper axe']), [GearStat.AttackSlash])
	},
	itemCost: {
		itemCost: new Bank()
			.add('Super combat potion(4)')
			.add('Enhanced saradomin brew', 3)
			.add('Enhanced super restore'),
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
					itemID: itemID('Axe of the high sungod')
				}
			]
		}
	]
};

export const OrymOrrodilMonsters = {
	Orym,
	Orrodil
};
