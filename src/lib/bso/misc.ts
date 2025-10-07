import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '@/lib/bso/collection-log/main.js';

import { GearStat, type OffenceGearStat } from 'oldschooljs/gear';

import type { PrimaryGearSetupType } from '@/lib/gear/types.js';

export const gorajanBoosts = [
	[gorajanArcherOutfit, 'range'],
	[gorajanWarriorOutfit, 'melee'],
	[gorajanOccultOutfit, 'mage']
] as const;

export const gearstatToSetup = new Map<OffenceGearStat, PrimaryGearSetupType>()
	.set(GearStat.AttackStab, 'melee')
	.set(GearStat.AttackSlash, 'melee')
	.set(GearStat.AttackCrush, 'melee')
	.set(GearStat.AttackMagic, 'mage')
	.set(GearStat.AttackRanged, 'range');
