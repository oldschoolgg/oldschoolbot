import killableMonsters from '../minions/data/killableMonsters';
import { KillableMonster } from '../minions/types';
import { stringMatches } from '../util';

export function findMonster(str: string): KillableMonster | undefined {
	const mon = killableMonsters.find(
		mon => stringMatches(mon.name, str) || mon.aliases.some(alias => stringMatches(alias, str))
	);
	return mon;
}
