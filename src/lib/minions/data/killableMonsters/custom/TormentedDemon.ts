import { Time } from 'e';
import { Bank, LootTable, Monsters } from 'oldschooljs';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { GearStat } from '../../../../gear';
import { GrimyHerbTable, lowRuneHighAdamantTable, runeAlchablesTable } from '../../../../simulation/sharedTables';
import itemID from '../../../../util/itemID';
import { CustomMonster } from './customMonsters';

export const TormentedDemon: CustomMonster = {
	id: 941_944,
	name: 'Tormented Demon',
	aliases: ['tormented demon', 'td'],
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
		.tertiary(60, 'Clue scroll (grandmaster)')
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
		resolveNameBank({
			'TzKal cape': 5
		})
	],
	equippedItemBoosts: [
		{
			items: [{ boostPercent: 10, itemID: itemID('Axe of the high sungod') }],
			gearSetup: 'melee'
		}
	]
};
