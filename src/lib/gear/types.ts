import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

import { Gear } from '../structures/Gear';

export type UserFullGearSetup = {
	[key in GearSetupTypes]: Gear;
};

export enum GearSetupTypes {
	Melee = 'melee',
	Mage = 'mage',
	Range = 'range',
	Misc = 'misc',
	Skilling = 'skilling',
	Wildy = 'wildy'
}
export type GearSetupType = 'melee' | 'mage' | 'range' | 'misc' | 'skilling' | 'wildy';

export enum GearStat {
	AttackStab = 'attack_stab',
	AttackSlash = 'attack_slash',
	AttackCrush = 'attack_crush',
	AttackMagic = 'attack_magic',
	AttackRanged = 'attack_ranged',
	DefenceStab = 'defence_stab',
	DefenceSlash = 'defence_slash',
	DefenceCrush = 'defence_crush',
	DefenceMagic = 'defence_magic',
	DefenceRanged = 'defence_ranged',
	MeleeStrength = 'melee_strength',
	RangedStrength = 'ranged_strength',
	MagicDamage = 'magic_damage',
	Prayer = 'prayer'
}

export interface GearSlotItem {
	item: number;
	quantity: number;
}

export type GearSetup = {
	[key in EquipmentSlot]: GearSlotItem | null;
};

export interface GearStats {
	attack_stab: number;
	attack_slash: number;
	attack_crush: number;
	attack_magic: number;
	attack_ranged: number;
	defence_stab: number;
	defence_slash: number;
	defence_crush: number;
	defence_magic: number;
	defence_ranged: number;
	melee_strength: number;
	ranged_strength: number;
	magic_damage: number;
	prayer: number;
}

export type OffenceGearStat =
	| GearStat.AttackMagic
	| GearStat.AttackRanged
	| GearStat.AttackSlash
	| GearStat.AttackStab
	| GearStat.AttackCrush;

export type DefenceGearStat =
	| GearStat.DefenceMagic
	| GearStat.DefenceRanged
	| GearStat.DefenceSlash
	| GearStat.DefenceStab
	| GearStat.DefenceCrush;

export type OtherGearStat = GearStat.MeleeStrength | GearStat.RangedStrength | GearStat.MagicDamage | GearStat.Prayer;

export type GearRequired = Partial<
	{
		[key in EquipmentSlot]: number[];
	}
>;
