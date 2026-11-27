import { MonsterSlayerMaster } from '@/meta/monsterData.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const BrutusTable = new LootTable({ limit: 81 })
	.every('Raw t-bone steak')
	.every('Bull bones')
	.tertiary(15, 'Clue scroll (beginner)')
	.tertiary(40, 'Clue scroll (easy)')
	.tertiary(30, 'Mooleta')
	.tertiary(37.5, 'Bottomless milk bucket (empty)')
	.tertiary(150, 'Cow slippers')
	.tertiary(1000, 'Beef')
	.add('Raw t-bone steak', 3, 10)
	.add('Air rune', 29, 10)
	.add('Cowhide', 1, 10)
	.add('Iron arrow', 14, 10)
	.add('Potato seed', 3, 10)
	.add('Mind rune', 18, 8)
	.add('Acorn', 2, 5)
	.add('Oak logs', 2, 5)
	.add('Logs', 2, 5)
	.add('Chaos rune', 12, 2)
	.add('Iron platebody', 1, 2)
	.add('Iron full helm', 1, 2)
	.add('Iron platelegs', 1, 1)
	.add('Iron plateskirt', 1, 1);

export const Brutus = new SimpleMonster({
	id: 15626,
	name: 'Brutus',
	aliases: ['brutus', 'cow boss'],
	hitpoints: 58,
	combatLevel: 30,
	table: BrutusTable
});

// Brutus is newer than the bundled monster metadata snapshot.
Brutus.data = {
	members: false,
	combatLevel: 30,
	hitpoints: 58,
	attackSpeed: 4,
	aggressive: false,
	immuneToPoison: false,
	immuneToVenom: false,
	category: ['cows'],
	attackLevel: 1,
	strengthLevel: 1,
	defenceLevel: 1,
	magicLevel: 1,
	rangedLevel: 1,
	attackStab: 0,
	attackSlash: 0,
	attackCrush: 0,
	attackMagic: 0,
	attackRanged: 0,
	defenceStab: 0,
	defenceSlash: 0,
	defenceCrush: 0,
	defenceMagic: 0,
	defenceRanged: 0,
	attackAccuracy: 0,
	meleeStrength: 0,
	rangedStrength: 0,
	magicDamage: 0,
	isSlayerMonster: true,
	slayerLevelRequired: 1,
	slayerXP: 116,
	assignableSlayerMasters: [MonsterSlayerMaster.Turael]
};
