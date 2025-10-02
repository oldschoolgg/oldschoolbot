import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank, LootTable, Monsters, RareDropTable } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

import { GrimyHerbTable, lowRuneHighAdamantTable, runeAlchablesTable } from '@/lib/simulation/sharedTables.js';

export const SuperiorTormentedDemon: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.SUPERIOR_TORMENTED_DEMON,
	name: 'Superior Tormented Demon',
	aliases: ['superior tormented demon', 'std'],
	timeToFinish: Time.Minute * 17,
	table: new LootTable()
		.every('Infernal ashes')
		.tertiary(256, 'Dragon limbs')
		.tertiary(128, new LootTable().add('Dragon claw').add('Offhand dragon claw'))
		.tertiary(
			302,
			new LootTable()
				.add('Ruined dragon armour slice')
				.add('Ruined dragon armour lump')
				.add('Ruined dragon armour shard')
		)
		.tertiary(40, 'Clue scroll (grandmaster)')
		.tertiary(32, RareDropTable)
		.add(GrimyHerbTable)
		.add(runeAlchablesTable)
		.add(lowRuneHighAdamantTable)
		.add(
			new LootTable()
				.add('Diamond', 4)
				.add('Adamantite stone spirit', 4)
				.add('Death rune', [20, 40])
				.add('Blood rune', [10, 20])
				.add('Coins', [300_000, 600_000])
		),
	difficultyRating: 7,
	qpRequired: 126,
	healAmountNeeded: 50 * 20,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackSlash],
	minimumGearRequirements: {
		melee: {
			[GearStat.AttackStab]: 100,
			[GearStat.DefenceStab]: 150,
			[GearStat.DefenceSlash]: 150,
			[GearStat.DefenceMagic]: -20,
			[GearStat.DefenceRanged]: 150
		}
	},
	groupKillable: false,
	respawnTime: Time.Second * 5,
	levelRequirements: {
		agility: 55,
		hunter: 65,
		thieving: 70,
		defence: 75,
		farming: 75,
		herblore: 70,
		magic: 80
	},
	baseMonster: Monsters.BlackDemon,
	itemCost: {
		qtyPerKill: 1,
		itemCost: new Bank().add('Divine water')
	},
	hp: 657,
	itemInBankBoosts: [
		new Bank({
			'TzKal cape': 5
		}).toJSON(),
		new Bank({
			'Axe of the high sungod': 10
		}).toJSON()
	]
};
