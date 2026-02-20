import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit, empyreanOutfit } from '@/lib/bso/collection-log/main.js';
import type { KillableMonster } from '@/lib/minions/types.js';

export const gorajanBoosts = [
	[gorajanWarriorOutfit, 'melee'],
	[gorajanArcherOutfit, 'range'],
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

	const empyreanEquipped = user.gear.melee.hasEquipped(empyreanOutfit, true);

	const allGorajan = gorajanBoosts.every(e => {
		if (e[1] === 'melee') return user.gear.melee.hasEquipped(e[0], true) || empyreanEquipped;
		return user.gear[e[1]].hasEquipped(e[0], true);
	});

	for (const [outfit, setup] of gorajanBoosts) {
		const effectiveEquipped =
			setup === 'melee'
				? user.gear.melee.hasEquipped(outfit, true) || empyreanEquipped
				: user.gear[setup].hasEquipped(outfit, true);

		if (allGorajan || (attackStyle === setup && effectiveEquipped)) {
			goraBoost = true;
			break;
		}
	}
	return goraBoost;
}