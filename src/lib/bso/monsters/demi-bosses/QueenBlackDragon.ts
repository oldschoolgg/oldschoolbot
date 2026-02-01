import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { GearStat } from '@oldschoolgg/gear';
import { Time } from '@oldschoolgg/toolkit';
import { deepResolveItems, itemID, LootTable, Monsters, RareDropTable, resolveItems } from 'oldschooljs';

import { HighSeedPackTable } from '@/lib/data/seedPackTables.js';

export const QueenBlackDragon: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.QUEEN_BLACK_DRAGON,
	name: 'Queen Black Dragon',
	aliases: ['queen black dragon', 'qbd', 'qdb'],
	timeToFinish: Time.Minute * 45,
	table: new LootTable()
		.every('Royal dragon bones')
		.every('Royal dragonhide', [5, 7])
		.tertiary(2500, 'Queen black dragonling')
		.tertiary(500, 'Draconic visage')
		.tertiary(250, 'Royal dragon kiteshield')
		.tertiary(64, 'Dragonbone upgrade kit')
		.tertiary(37, 'Clue scroll (grandmaster)')
		.oneIn(
			18,
			new LootTable()
				.add('Royal torsion spring')
				.add('Royal sight')
				.add('Royal frame')
				.add('Royal bolt stabiliser')
		)
		.add('Rocktail', [4, 10])
		.add('Saradomin brew(2)', [4, 10])
		.add('Super restore(2)', [4, 10])
		.add(new LootTable().add('Adamantite stone spirit').add('Runite stone spirit'), [1, 3])
		.add('Uncut dragonstone', 5)
		.add(HighSeedPackTable)
		.tertiary(30, RareDropTable),
	qpRequired: 182,
	healAmountNeeded: 20 * 45,
	attackStyleToUse: GearStat.AttackRanged,
	attackStylesUsed: [GearStat.AttackStab, GearStat.AttackSlash, GearStat.AttackMagic, GearStat.AttackRanged],
	disallowedAttackStyles: ['attack', 'strength', 'defence', 'magic'],
	minimumGearRequirements: {
		range: {
			attack_stab: 0,
			attack_slash: 0,
			attack_crush: 0,
			attack_magic: -37,
			attack_ranged: 78,
			defence_stab: 0,
			defence_slash: 0,
			defence_crush: 0,
			defence_magic: 100,
			defence_ranged: 142,
			melee_strength: 0,
			ranged_strength: 2,
			magic_damage: 0,
			prayer: 3
		}
	},
	itemsRequired: deepResolveItems([['Dragonfire shield', 'Dragonfire ward']]),
	respawnTime: Time.Second * 20,
	levelRequirements: {
		prayer: 70,
		defence: 80,
		ranged: 85
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 6
		}
	},
	notifyDrops: resolveItems(['Queen black dragonling']),
	baseMonster: Monsters.Vorkath,
	itemInBankBoosts: [
		{
			[itemID('Royal crossbow')]: 8
		}
	]
};
