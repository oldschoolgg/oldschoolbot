import { GearStat, type OffenceGearStat } from 'oldschooljs/gear';

import type { User } from '@/prisma/main.js';
import type { PrimaryGearSetupType } from '@/lib/gear/types.js';

export const attackStylesArr = ['attack', 'strength', 'defence', 'magic', 'ranged'] as const;
export type AttackStyles = (typeof attackStylesArr)[number];

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
