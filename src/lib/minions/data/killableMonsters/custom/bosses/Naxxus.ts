import { Time } from 'e';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import LootTable from 'oldschooljs/dist/structures/LootTable';
import { GearStat } from '../../../../../gear';
import { KillableMonster } from '../../../../../minions/types';
import { makeKillTable } from '../../../../../util/setCustomMonster';

import { MysteryBoxes } from '../../../../../data/openables';

export const NaxxusLootTable = new LootTable()
	.add('Rune pickaxe', [1, 9])
	.add('Rune full helm', [5, 9])
	.add('Rune platelegs', [5, 9])
	.add('Rune 2h sword', [5, 9])
	.add('Rune battleaxe', [5, 9])
	.add('Clue scroll (medium)', [1, 3])
	.add('Dragon longsword', [5, 4])
	.add('Dragon med helm', [5, 4])
	.add('Elder rune', [50, 100])
	.add('Pure essence', [1000, 2000])
	.tertiary(16, RareDropTable)
	.tertiary(12, 'Clue scroll (grandmaster)')
	.tertiary(15, MysteryBoxes)
	.tertiary(1000, 'Jar of magic')
	.tertiary(500, 'Voidling')
	.tertiary(350, 'Magus scroll')
	.tertiary(350, 'Tattered robes of Vasa')
	.tertiary(9, 'Magical artifact');

export const Naxxus: KillableMonster = {
	id: 294_820,
	name: 'Naxxus',
	aliases: ['nax'],
	timeToFinish: Time.Minute * 25,
	// notifyDrops: nexCL,
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