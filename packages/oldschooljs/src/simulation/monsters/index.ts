import type { Monster, SimpleMonster } from '@/structures/Monster.js';
import { allBosses } from './bosses/index.js';
import { CreatureCreation } from './CreatureCreation.js';
import { CamdozaalGolems } from './low/camdozaalGolems.js';
import { allLowMonsters } from './low/index.js';
import { ReanimatedMonsters } from './low/reanimated.js';
import { specialBosses } from './special/index.js';
import { allSuperiorMonsters } from './superiorMonsters/index.js';

const monstersObject = {
	...allBosses,
	...allLowMonsters,
	...specialBosses,
	...allSuperiorMonsters,
	...CreatureCreation,
	...ReanimatedMonsters,
	...CamdozaalGolems
};

const allMonsters: [number, Monster][] = Object.values(monstersObject).map((monster: Monster) => [monster.id, monster]);
const allMonstersMap = new Map<number, Monster>(allMonsters);
class MonsterCollection {
	map<T>(callback: (value: Monster) => T): T[] {
		const result: T[] = [];
		for (const mon of allMonsters.map(([, mon]) => mon)) {
			result.push(callback(mon));
		}
		return result;
	}
	get(id: number): Monster | undefined {
		return allMonstersMap.get(id);
	}
	find(predicate: (value: Monster) => boolean): Monster | undefined {
		for (const mon of allMonsters.map(([, mon]) => mon)) {
			if (predicate(mon)) return mon;
		}
		return undefined;
	}
}

const monstersCollection = Object.assign(new MonsterCollection(), monstersObject);

export const Monsters: MonsterCollection & Record<string, SimpleMonster> = new Proxy(monstersCollection, {
	get(target, prop) {
		if (typeof prop === 'symbol' || prop in target) {
			return target[prop as keyof typeof target];
		}

		throw new Error(`Monster "${String(prop)}" does not exist`);
	}
});
