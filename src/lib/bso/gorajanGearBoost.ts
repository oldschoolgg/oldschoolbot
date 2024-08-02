import { gearstatToSetup, gorajanBoosts } from '../../mahoji/lib/abstracted_commands/minionKill';
import type { KillableMonster } from '../minions/types';

export function gorajanGearBoost(user: MUser, monster: KillableMonster | string) {
	let attackStyle = null;
	let goraBoost = false;

	if (typeof monster !== 'string' && monster.attackStyleToUse) {
		attackStyle = gearstatToSetup.get(monster.attackStyleToUse);
	} else if (monster === 'Colosseum') {
		attackStyle = 'melee';
	} else {
		return goraBoost;
	}

	const allGorajan = gorajanBoosts.every(e => user.gear[e[1]].hasEquipped(e[0], true));
	for (const [outfit, setup] of gorajanBoosts) {
		if (allGorajan || (attackStyle === setup && user.gear[setup].hasEquipped(outfit, true))) {
			goraBoost = true;
			break;
		}
	}
	return goraBoost;
}
