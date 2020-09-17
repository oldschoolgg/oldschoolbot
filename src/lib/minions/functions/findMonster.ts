import { stringMatches } from '../../util';
import killableMonsters from '../data/killableMonsters';
import { KillableMonster } from '../types';

export default function findMonster(str: string): KillableMonster | undefined {
	const mon = killableMonsters.find(
		mon => stringMatches(mon.name, str) || mon.aliases.some(alias => stringMatches(alias, str))
	);
	return mon;
}
