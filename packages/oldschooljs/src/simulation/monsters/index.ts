import { Collection } from '../../structures/Collection';
import type Monster from '../../structures/Monster';
import { CreatureCreation } from './CreatureCreation';
import { allBosses } from './bosses';
import { allLowMonsters } from './low';
import { CamdozaalGolems } from './low/camdozaalGolems';
import { ReanimatedMonsters } from './low/reanimated';
import { specialBosses } from './special';
import { allSuperiorMonsters } from './superiorMonsters';

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

export default Monsters;
