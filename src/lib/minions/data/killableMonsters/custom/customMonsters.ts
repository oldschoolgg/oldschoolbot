import { LootTable } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import setCustomMonster, { makeKillTable } from '../../../../util/setCustomMonster';
import { KillableMonster } from '../../../types';
import { customDemiBosses } from './demiBosses';
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
}

export const customKillableMonsters: KillableMonster[] = [];

export const BSOMonsters = {
	...customDemiBosses,
	...resourceDungeonMonsters
};

for (const monster of Object.values(BSOMonsters)) {
	const monsterData = { ...monster.baseMonster };
	if (monster.hp) {
		monsterData.data.hitpoints = monster.hp;
	}
	setCustomMonster(monster.id, monster.name, monster.table, monsterData, { aliases: monster.aliases });
	customKillableMonsters.push({ ...monster, table: makeKillTable(monster.table) });
}
