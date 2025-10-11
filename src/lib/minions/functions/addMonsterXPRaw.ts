import { randomVariation } from '@oldschoolgg/rng';
import { type Monster, Monsters, NIGHTMARES_HP } from 'oldschooljs';

import { xpCannonVaryPercent, xpPercentToCannon, xpPercentToCannonM } from '@/lib/minions/data/combatConstants.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import { resolveAttackStyles } from '@/lib/minions/functions/resolveAttackStyles.js';
import { XPBank } from '@/lib/structures/XPBank.js';

const miscHpMap: Record<number, number> = {
	9415: NIGHTMARES_HP,
	3127: 250
};

export interface AddMonsterXpParams {
	monsterID: number;
	quantity: number;
	duration: number;
	isOnTask: boolean;
	taskQuantity: number | null;
	minimal?: boolean;
	usingCannon?: boolean;
	cannonMulti?: boolean;
	burstOrBarrage?: number;
	superiorCount?: number;
}

export function addMonsterXPRaw(params: {
	monsterID: number;
	quantity: number;
	duration: number;
	isOnTask: boolean;
	taskQuantity: number | null;
	minimal?: boolean;
	usingCannon?: boolean;
	cannonMulti?: boolean;
	burstOrBarrage?: number;
	superiorCount?: number;
	attackStyles: AttackStyles[];
}) {
	const boostMethod = params.burstOrBarrage ? (['barrage'] as const) : (['none'] as const);
	const maybeMonster = killableMonsters.find(m => m.id === params.monsterID);
	const maybeOSJSMonster = Monsters.get(params.monsterID);
	const attackStyles = resolveAttackStyles({
		monster: maybeMonster,
		boostMethod,
		attackStyles: params.attackStyles
	});
	let hp = miscHpMap[params.monsterID] ?? 1;
	let xpMultiplier = 1;
	const cannonQty = params.cannonMulti
		? randomVariation(Math.floor((xpPercentToCannonM / 100) * params.quantity), xpCannonVaryPercent)
		: params.usingCannon
			? randomVariation(Math.floor((xpPercentToCannon / 100) * params.quantity), xpCannonVaryPercent)
			: 0;

	// Remove superiors from the regular count to be added separately.
	let normalQty = 0;
	let superiorQty = 0;
	let osjsSuperior: Monster | undefined;
	if (params.isOnTask && params.superiorCount && maybeMonster?.superior) {
		osjsSuperior = maybeMonster.superior;
		if (osjsSuperior?.data?.hitpoints && osjsSuperior?.data?.slayerXP) {
			normalQty = params.quantity - cannonQty - params.superiorCount;
			superiorQty = params.superiorCount;
		} else {
			normalQty = params.quantity - cannonQty;
		}
	} else {
		normalQty = params.quantity - cannonQty;
	}

	// Calculate regular monster XP
	if (maybeMonster?.customMonsterHP) {
		hp = maybeMonster.customMonsterHP;
	} else if (maybeOSJSMonster?.data?.hitpoints) {
		hp = maybeOSJSMonster.data.hitpoints;
	}
	if (maybeMonster?.combatXpMultiplier) {
		xpMultiplier = maybeMonster.combatXpMultiplier;
	}

	// Calculate superior XP:
	let superiorSlayXp = 0;
	let superiorXp = 0;
	if (superiorQty && osjsSuperior?.data?.hitpoints) {
		superiorXp = 4 * superiorQty * osjsSuperior?.data?.hitpoints;
		superiorSlayXp = superiorQty * (osjsSuperior?.data?.slayerXP ?? 0);
	}

	const totalXP = hp * 4 * normalQty * xpMultiplier + superiorXp;
	const xpPerSkill = totalXP / attackStyles.length;

	const xpBank = new XPBank();
	const debugId = `d[${params.duration}] mid[${params.monsterID}] qty[${params.quantity}] ${params.isOnTask ? 'task' : 'notask'}`;

	for (const style of attackStyles) {
		xpBank.add(style, Math.floor(xpPerSkill), {
			duration: params.duration,
			minimal: params.minimal ?? true,
			debugId
		});
	}

	if (params.isOnTask) {
		let newSlayerXP = 0;
		if (maybeOSJSMonster?.data?.slayerXP) {
			newSlayerXP += params.taskQuantity! * maybeOSJSMonster.data.slayerXP;
		} else {
			newSlayerXP += params.taskQuantity! * hp;
		}
		// Give slayer XP for K'ril + Kree'Arra + Sire
		if (params.monsterID === Monsters.KrilTsutsaroth.id) {
			newSlayerXP += params.taskQuantity! * 142;
		}
		if (params.monsterID === Monsters.Kreearra.id) {
			newSlayerXP += params.taskQuantity! * (132.5 + 124 + 132.5);
		}
		if (params.monsterID === Monsters.AbyssalSire.id) {
			newSlayerXP += params.taskQuantity! * 200;
		}
		xpBank.add('slayer', newSlayerXP + superiorSlayXp, {
			duration: params.duration,
			minimal: params.minimal ?? true,
			debugId
		});
	}

	xpBank.add('hitpoints', Math.floor(hp * normalQty * 1.33 * xpMultiplier + superiorXp / 3), {
		duration: params.duration,
		minimal: params.minimal ?? true,
		debugId
	});

	// Add cannon xp last so it's easy to distinguish
	if (params.usingCannon || params.cannonMulti) {
		const cannonXp = Math.floor(hp * 2 * cannonQty);
		xpBank.add('ranged', cannonXp, {
			duration: params.duration,
			minimal: params.minimal ?? true,
			debugId
		});
	}

	return xpBank;
}
