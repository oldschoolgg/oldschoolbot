import type { LootTable } from 'oldschooljs';
import type { MonsterData } from 'oldschooljs/dist/meta/monsterData';
import type Monster from 'oldschooljs/dist/structures/Monster';

import setCustomMonster, { makeKillTable } from '../../../../util/setCustomMonster';
import type { KillableMonster } from '../../../types';
import { SunMoonMonsters } from './SunMoon';
import { customDemiBosses } from './demiBosses';
import { MiscCustomMonsters } from './misc';
import { resourceDungeonMonsters } from './resourceDungeons';

declare module 'oldschooljs/dist/structures/Monster' {
	export default interface Monster {
		isCustom?: true;
	}
}

export interface CustomMonster extends Readonly<Omit<Readonly<KillableMonster>, 'table'>> {
	readonly table: LootTable;
	readonly baseMonster: Monster;
	readonly hp?: number;
	readonly customMonsterData?: Partial<MonsterData>;
	readonly allItems?: number[];
}

export const customKillableMonsters: KillableMonster[] = [];

export const BSOMonsters = {
	...customDemiBosses,
	...resourceDungeonMonsters,
	...MiscCustomMonsters,
	...SunMoonMonsters
};

for (const monster of Object.values(BSOMonsters)) {
	const monsterData = { ...monster.baseMonster };
	// This is necessary otherwise changes to HP, etc overwrite the base Monster:
	monsterData.data = { ...monsterData.data };
	if (monster.hp) {
		monsterData.data.hitpoints = monster.hp;
	}
	if (monster.customMonsterData) {
		monsterData.data = { ...monsterData.data, ...monster.customMonsterData };
	}
	setCustomMonster(monster.id, monster.name, monster.table, monsterData, {
		aliases: monster.aliases
	});
	customKillableMonsters.push({ ...monster, table: makeKillTable(monster.table) });
}
