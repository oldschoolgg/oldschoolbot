import { Time } from 'e';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { naxxusCL } from '../../../../../data/CollectionsExport';
import { GearStat } from '../../../../../gear';
import { KillableMonster } from '../../../../../minions/types';
import { makeKillTable } from '../../../../../util/setCustomMonster';

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
	.add('Elder rune', [25, 150])
	.add('Pure essence', [1000, 2000]);

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
	.add('Guam leaf', [100, 500])
	.add('Marrentill', [100, 500])
	.add('Tarromin', [100, 500])
	.add('Harralander', [100, 250])
	.add('Ranarr weed', [20, 30])
	.add('Toadflax', [40, 60])
	.add('Irit leaf', [100, 250])
	.add('Avantoe', [50, 75])
	.add('Kwuarm', [50, 75])
	.add('Snapdragon', [5, 10])
	.add('Cadantine', [40, 60])
	.add('Lantadyme', [50, 75])
	.add('Dwarf weed', [100, 250])
	.add('Torstol', [20, 30])
	.add('Athelas', [10, 15])
	.add('Korulsi', [10, 15]);

const orbs = new LootTable().add('Air orb', 100).add('Earth orb', 100).add('Fire orb', 100).add('Water orb', 100);

const naxxusLoot = new LootTable().add(runes, 3).add(talismans, 3).add(herbs, 3).add(orbs, 3);

export const NaxxusLootTable = new LootTable()
	.add(naxxusLoot, 2)
	.tertiary(3, 'Clue scroll (Grandmaster)')
	.tertiary(750, 'Dark Crystal')
	.tertiary(500, 'Abyssal Gem')
	.tertiary(750, 'Tattered Tome')
	.tertiary(500, 'Spellbound Ring')
	.tertiary(10, 'Korulsi Seed');

export const Naxxus: KillableMonster = {
	id: 294_820,
	name: 'Naxxus',
	aliases: ['nax'],
	timeToFinish: Time.Minute * 30,
	notifyDrops: naxxusCL,
	table: makeKillTable(NaxxusLootTable),
	emoji: '',
	wildy: false,
	difficultyRating: 10,
	qpRequired: 0,
	groupKillable: false,
	respawnTime: Time.Second * 10,
	levelRequirements: {
		slayer: 110,
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
