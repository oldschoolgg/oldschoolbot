import { LootTable, Monsters } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import setCustomMonster, { makeKillTable } from '../../../../util/setCustomMonster';
import { KillableMonster } from '../../../types';
import { customDemiBosses } from './demiBosses';
import { resourceDungeonMonsters } from './resourceDungeons';

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
	if (Monsters.get(monster.id)) {
		throw new Error(
			`Tried to set custom monster called ${monster.name}, but one already existed with the same ID: ${monster.id}`
		);
	}

	const monsterData = { ...monster.baseMonster };
	if (monster.hp) {
		monsterData.data.hitpoints = monster.hp;
	}
	setCustomMonster(monster.id, monster.name, monster.table, monsterData, { aliases: monster.aliases });
	customKillableMonsters.push({ ...monster, table: makeKillTable(monster.table) });
}
