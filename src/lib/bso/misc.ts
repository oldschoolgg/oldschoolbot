import { gorajanArcherOutfit, gorajanOccultOutfit, gorajanWarriorOutfit } from '../data/CollectionsExport';
import { GearStat, type OffenceGearStat, type PrimaryGearSetupType } from '../gear';

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
