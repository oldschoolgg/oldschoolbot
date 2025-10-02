import type { LootTable, Monster, MonsterData } from 'oldschooljs';

import type { KillableMonster } from '@/lib/minions/types.js';

export interface CustomMonster extends Readonly<Omit<Readonly<KillableMonster>, 'table'>> {
	readonly table: LootTable;
	readonly baseMonster: Monster;
	readonly hp?: number;
	readonly customMonsterData?: Partial<MonsterData>;
	readonly allItems?: number[];
	isCustom: true;
}
