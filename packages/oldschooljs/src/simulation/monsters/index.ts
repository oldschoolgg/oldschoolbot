import { Collection } from '../../structures/Collection.js';
import { CreatureCreation } from './CreatureCreation.js';
import { allBosses } from './bosses/index.js';
import { allLowMonsters } from './low/index.js';
import { CamdozaalGolems } from './low/camdozaalGolems.js';
import { ReanimatedMonsters } from './low/reanimated.js';
import { specialBosses } from './special/index.js';
import { allSuperiorMonsters } from './superiorMonsters/index.js';
import type { Monster } from '@/structures/Monster.js';

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

export const Monsters = Object.assign(new Collection(allMonsters), monstersObject);
