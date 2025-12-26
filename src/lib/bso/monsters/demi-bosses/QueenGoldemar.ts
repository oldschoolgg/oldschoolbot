import { EBSOMonster } from '@/lib/bso/EBSOMonster.js';
import type { CustomMonster } from '@/lib/bso/monsters/CustomMonster.js';

import { Time } from '@oldschoolgg/toolkit';
import { GearStat, LootTable, Monsters } from 'oldschooljs';

export const QueenGoldemar: CustomMonster = {
	isCustom: true,
	id: EBSOMonster.QUEEN_GOLDEMAR,
	name: 'Queen Goldemar',
	aliases: ['queen goldemar'],
	timeToFinish: Time.Minute * 32,
	table: new LootTable()
		.every('Bones')
		.tertiary(
			100,
			new LootTable()
				.add('Offhand dwarven spatula')
				.add('Queen goldemar skirt')
				.add('Dwarven frying pan')
				.add('Queen goldemar beard')
				.add('Queen goldemar blouse')
		)
		.tertiary(3000, 'Dwarfqueen tiara')
		.add('Beer', [1, 4])
		.add('Kebab', [1, 4])
		.add('Jewellery')
		.add('Skull piece')
		.add('Dwarven rock cake')
		.add('Dwarven stout')
		.tertiary(5000, 'Clue scroll (grandmaster)'),
	healAmountNeeded: 20 * 32,
	attackStyleToUse: GearStat.AttackStab,
	attackStylesUsed: [GearStat.AttackStab, GearStat.AttackSlash, GearStat.AttackMagic, GearStat.AttackRanged],
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
	hp: 800,
	respawnTime: Time.Second * 10,
	levelRequirements: {
		prayer: 121,
		attack: 99,
		strength: 105,
		magic: 105,
		defence: 150
	},
	pohBoosts: {
		pool: {
			'Ancient rejuvenation pool': 15
		}
	},
	baseMonster: Monsters.Hespori,
	tameCantKill: true
};
