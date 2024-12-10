import { desertTreasureKillableBosses } from './dt';
import gwdBosses from './gwd';
import miscBosses from './misc';
import { wildyKillableMonsters } from './wildy';

export const bossKillables = [...gwdBosses, ...miscBosses, ...wildyKillableMonsters, ...desertTreasureKillableBosses];
