import { stringMatches } from '@oldschoolgg/toolkit';

import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import type { KillableMonster } from '@/lib/minions/types.js';

export default function findMonster(str = ''): KillableMonster | undefined {
	const mon = killableMonsters.find(
		mon =>
			stringMatches(mon.id.toString(), str) ||
			stringMatches(mon.name, str) ||
			mon.aliases.some(alias => stringMatches(alias, str))
	);
	return mon;
}
