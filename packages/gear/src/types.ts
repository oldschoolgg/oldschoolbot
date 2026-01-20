export enum EquipmentSlot {
	TwoHanded = '2h',
	Ammo = 'ammo',
	Body = 'body',
	Cape = 'cape',
	Feet = 'feet',
	Hands = 'hands',
	Head = 'head',
	Legs = 'legs',
	Neck = 'neck',
	Ring = 'ring',
	Shield = 'shield',
	Weapon = 'weapon'
}

export type EquipmentSlotKey = `${EquipmentSlot}`;

export const allEquipmentSlots: EquipmentSlot[] = [
	EquipmentSlot.TwoHanded,
	EquipmentSlot.Ammo,
	EquipmentSlot.Body,
	EquipmentSlot.Cape,
	EquipmentSlot.Feet,
	EquipmentSlot.Hands,
	EquipmentSlot.Head,
	EquipmentSlot.Legs,
	EquipmentSlot.Neck,
	EquipmentSlot.Ring,
	EquipmentSlot.Shield,
	EquipmentSlot.Weapon
];

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
