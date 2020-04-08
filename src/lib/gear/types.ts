import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

export enum GearSetupTypes {
	Melee = 'melee',
	Mage = 'mage',
	Range = 'range',
	Misc = 'misc',
	Skilling = 'skilling'
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
