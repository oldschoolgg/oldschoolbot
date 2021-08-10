import gwdBosses from './gwd';
import miscBosses from './misc';
import { wildyKillableMonsters } from './wildy';

export default [...gwdBosses, ...miscBosses, ...wildyKillableMonsters];
