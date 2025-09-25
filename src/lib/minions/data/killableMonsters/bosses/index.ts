import { desertTreasureKillableBosses } from './dt.js';
import gwdBosses from './gwd.js';
import miscBosses from './misc.js';
import { wildyKillableMonsters } from './wildy.js';

export const bossKillables = [...gwdBosses, ...miscBosses, ...wildyKillableMonsters, ...desertTreasureKillableBosses];
