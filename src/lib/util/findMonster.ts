import { stringMatches } from '@oldschoolgg/toolkit/util';

import killableMonsters from '../minions/data/killableMonsters';
import type { KillableMonster } from '../minions/types';

export default function findMonster(str = ''): KillableMonster | undefined {
	const mon = killableMonsters.find(
		mon =>
			stringMatches(mon.id.toString(), str) ||
			stringMatches(mon.name, str) ||
			mon.aliases.some(alias => stringMatches(alias, str))
	);
	return mon;
}
