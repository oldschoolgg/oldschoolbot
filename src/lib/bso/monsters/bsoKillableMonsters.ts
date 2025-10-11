import { BSOMonsters } from '@/lib/bso/monsters/customMonsters.js';
import { makeKillTable, setCustomMonster } from '@/lib/bso/monsters/setCustomMonster.js';

import type { KillableMonster } from '@/lib/minions/types.js';

export const bsoKillableMonsters: KillableMonster[] = [];

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
	bsoKillableMonsters.push({ ...monster, table: makeKillTable(monster.table) });
}
