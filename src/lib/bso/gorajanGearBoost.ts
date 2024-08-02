import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../data/CollectionsExport';
import type { KillableMonster } from '../minions/types';

export const gorajanBoosts = [
	[gorajanArcherOutfit, 'range'],
	[gorajanWarriorOutfit, 'melee'],
	[gorajanOccultOutfit, 'mage']
] as const;

export const gearstatToSetup = new Map()
	.set('attack_stab', 'melee')
	.set('attack_slash', 'melee')
	.set('attack_crush', 'melee')
	.set('attack_magic', 'mage')
	.set('attack_ranged', 'range');

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
