import type { KillableMonster } from '@/lib/minions/types.js';

export default function isImportantItemForMonster(itemID: number, monster: KillableMonster) {
	if (!monster.uniques) return false;
	if ((monster.uniques as number[]).some(drop => drop === itemID)) {
		return true;
	}
	return false;
}
