import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import { makeKillTable, setCustomMonster } from '@/lib/bso/monsters/setCustomMonster.js';

import { roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, LootTable, Monsters, resolveItems } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

export function rollNaxxusLoot(quantity = 1, cl?: Bank) {
	const loot = new Bank();
	loot.add(NaxxusLootTable.roll(quantity));

	// Handle uniques => Don't give duplicates until log full
	const uniqueChance = 150;
	// Add new uniques to a dummy CL to support multiple uniques per trip.
	const tempClWithNewUniques = cl ? cl.clone() : new Bank();
	for (let i = 0; i < quantity; i++) {
		if (roll(uniqueChance)) {
			const uniques = [
				{ name: 'Dark crystal', weight: 2 },
				{ name: 'Abyssal gem', weight: 3 },
				{ name: 'Tattered tome', weight: 2 },
				{ name: 'Spellbound ring', weight: 3 }
			];

			const filteredUniques = uniques.filter(u => !tempClWithNewUniques.has(u.name));
			const uniqueTable = filteredUniques.length === 0 ? uniques : filteredUniques;
			const lootTable = new LootTable();
			uniqueTable.map(u => lootTable.add(u.name, 1, u.weight));

			const unique = lootTable.roll();
			tempClWithNewUniques.add(unique);
			loot.add(unique);
		}
	}
	return loot;
}

const runes = new LootTable()
	.add('Air rune', [5000, 15_000])
	.add('Earth rune', [5000, 15_000])
	.add('Fire rune', [5000, 15_000])
	.add('Water rune', [5000, 15_000])
	.add('Mind rune', [5000, 15_000])
	.add('Body rune', [5000, 15_000])
	.add('Cosmic rune', [5000, 15_000])
	.add('Chaos rune', [2500, 6000])
	.add('Nature rune', [1250, 3000])
	.add('Law rune', [1250, 3000])
	.add('Death rune', [1500, 3000])
	.add('Blood rune', [1250, 3000])
	.add('Soul rune', [1250, 3000])
	.add('Wrath rune', [1250, 3000])
	.add('Elder rune', [75, 250])
	.add('Pure essence', [2500, 5000]);

const talismans = new LootTable()
	.add('Cosmic talisman', [10, 25])
	.add('Chaos talisman', [10, 25])
	.add('Nature talisman', [10, 25])
	.add('Death talisman', [10, 25])
	.add('Wrath talisman', [10, 25])
	.add('Air talisman', [10, 25])
	.add('Mind talisman', [10, 25])
	.add('Water talisman', [10, 25])
	.add('Earth talisman', [10, 25])
	.add('Fire talisman', [10, 25])
	.add('Body talisman', [10, 25]);

const herbs = new LootTable()
	.add('Guam leaf', [150, 500])
	.add('Marrentill', [150, 500])
	.add('Tarromin', [150, 500])
	.add('Harralander', [150, 250])
	.add('Ranarr weed', [30, 50])
	.add('Toadflax', [50, 70])
	.add('Irit leaf', [150, 250])
	.add('Avantoe', [60, 75])
	.add('Kwuarm', [60, 75])
	.add('Snapdragon', [15, 25])
	.add('Cadantine', [50, 75])
	.add('Lantadyme', [75, 100])
	.add('Dwarf weed', [150, 250])
	.add('Torstol', [30, 50])
	.add('Athelas', [15, 25])
	.add('Korulsi', [15, 25]);

const custom = new LootTable().add('Battlestaff', [250, 500]).add('Dark animica', [5, 10]);

const orbs = new LootTable()
	.add('Air orb', [50, 100])
	.add('Earth orb', [50, 100])
	.add('Fire orb', [50, 100])
	.add('Water orb', [50, 100]);

const naxxusLoot = new LootTable().add(runes, 3).add(talismans, 3).add(herbs, 3).add(orbs, 3).add(custom, 3);

export const NaxxusLootTable = new LootTable()
	.add(naxxusLoot, 2)
	.tertiary(9, 'Clue scroll (grandmaster)')
	.tertiary(10, 'Korulsi seed')
	.tertiary(25, 'Grand crystal acorn')
	.tertiary(2500, 'Tormented skull');

export const NaxxusLootTableFinishable = NaxxusLootTable.clone()
	.tertiary(500, 'Spellbound ring')
	.tertiary(500, 'Abyssal gem')
	.tertiary(750, 'Tattered tome')
	.tertiary(750, 'Dark crystal');

export const NAXXUS_HP = 3900;

export const Naxxus = {
	id: EBSOMonster.NAXXUS,
	name: 'Naxxus',
	aliases: ['nax', 'naxx', 'naxus', 'naxxus'],
	timeToFinish: Time.Minute * 30,
	notifyDrops: resolveItems(['Dark crystal', 'Abyssal gem', 'Tattered tome', 'Spellbound ring']),
	table: makeKillTable(NaxxusLootTableFinishable),
	emoji: '',
	wildy: false,
	difficultyRating: 10,
	qpRequired: 0,
	customMonsterHP: NAXXUS_HP,
	groupKillable: false,
	respawnTime: Time.Second * 10,
	levelRequirements: {
		slayer: 110,
		prayer: 110,
		magic: 120
	},
	minimumGearRequirements: {
		mage: {
			[GearStat.AttackMagic]: 250,
			[GearStat.DefenceMagic]: 250
		},
		melee: {
			[GearStat.AttackStab]: 250,
			[GearStat.DefenceCrush]: 250,
			[GearStat.DefenceRanged]: 250,
			[GearStat.DefenceSlash]: 250,
			[GearStat.DefenceStab]: 250
		}
	}
};

setCustomMonster(EBSOMonster.NAXXUS, 'Naxxus', NaxxusLootTableFinishable, Monsters.GeneralGraardor, {
	id: EBSOMonster.NAXXUS,
	name: 'Naxxus',
	aliases: ['naxxus', 'naxx']
});
