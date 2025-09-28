import { desertTreasureKillableBosses } from '@/lib/minions/data/killableMonsters/bosses/dt.js';
import { gwdKillables } from '@/lib/minions/data/killableMonsters/bosses/gwd.js';
import { miscBossKillables } from '@/lib/minions/data/killableMonsters/bosses/misc.js';
import { wildyKillableMonsters } from '@/lib/minions/data/killableMonsters/bosses/wildy.js';

export const bossKillables = [
	...gwdKillables,
	...miscBossKillables,
	...wildyKillableMonsters,
	...desertTreasureKillableBosses
];
