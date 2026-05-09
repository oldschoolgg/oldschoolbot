import { GearStat, type OffenceGearStat, type PrimaryGearSetupType } from '@oldschoolgg/gear';

import type { User } from '@/prisma/main.js';
import type { PvMMethod } from '@/lib/constants.js';
import type { KillableMonster } from '@/lib/minions/types.js';

export const attackStylesArr = ['attack', 'strength', 'defence', 'magic', 'ranged'] as const;
export type AttackStyles = (typeof attackStylesArr)[number];

interface ResolveAttackStylesParams {
	boostMethod?: PvMMethod[] | readonly PvMMethod[];
	attackStyles: AttackStyles[];
	monster?: KillableMonster;
}

export function resolveAttackStyles({
	monster,
	boostMethod,
	attackStyles: inputAttackStyle
}: ResolveAttackStylesParams): AttackStyles[] {
	// The styles chosen by this user to use.
	let attackStyles = inputAttackStyle ?? [];

	// The default attack styles to use for this monster, defaults to shared (melee)
	const monsterStyles =
		monster?.defaultAttackStyles ??
		attackStylesArr.filter(i => !monster?.disallowedAttackStyles?.includes(i)).slice(0, 1);

	// If their attack style can't be used on this monster, or they have no selected attack styles selected,
	// use the monsters default attack style.
	if (attackStyles.length === 0 || attackStyles.some(s => monster?.disallowedAttackStyles?.includes(s))) {
		attackStyles = monsterStyles;
	}

	// Automatically use magic if barrage/burst is chosen
	if (
		boostMethod &&
		(boostMethod.includes('barrage') || boostMethod.includes('burst')) &&
		!attackStyles.includes('magic')
	) {
		if (attackStyles.includes('defence')) {
			attackStyles = ['magic', 'defence'];
		} else {
			attackStyles = ['magic'];
		}
	}

	if (attackStyles.includes('magic') && attackStyles.includes('ranged')) {
		attackStyles = ['magic'];
	}
	return attackStyles;
}

const gearStyleMap = { melee: GearStat.AttackCrush, mage: GearStat.AttackMagic, range: GearStat.AttackRanged } as const;

export function getAttackStylesContext(styles: AttackStyles | User['attack_style']) {
	let primaryStyle: PrimaryGearSetupType = 'melee';
	if (styles.includes('magic')) primaryStyle = 'mage';
	else if (styles.includes('ranged')) primaryStyle = 'range';
	const relevantGearStat: OffenceGearStat = gearStyleMap[primaryStyle];
	return {
		primaryStyle,
		relevantGearStat
	};
}
