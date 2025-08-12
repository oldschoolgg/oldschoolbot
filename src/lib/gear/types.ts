import type { EquipmentSlot } from 'oldschooljs';

import type { Gear } from '../structures/Gear';

export type UserFullGearSetup = {
	[key in GearSetupType]: Gear;
};

export const GearSetupTypes = ['melee', 'range', 'mage', 'misc', 'skilling', 'wildy', 'fashion', 'other'] as const;

export type GearSetupType = (typeof GearSetupTypes)[number];

export const PrimaryGearSetupTypes = ['melee', 'range', 'mage'] as const;
export type PrimaryGearSetupType = (typeof PrimaryGearSetupTypes)[number];

export interface GearSlotItem {
	item: number;
	quantity: number;
}

export type GearSetup = {
	[key in EquipmentSlot]: GearSlotItem | null;
};
