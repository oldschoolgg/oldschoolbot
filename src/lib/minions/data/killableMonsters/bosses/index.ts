import { desertTreasureKillableBosses } from './dt.js';
import gwdBosses from './gwd.js';
import miscBosses from './misc.js';
import { wildyKillableMonsters } from './wildy.js';

export default [...gwdBosses, ...miscBosses, ...wildyKillableMonsters, ...desertTreasureKillableBosses];
