import { EquipmentSlot } from 'oldschooljs/dist/meta/types';

export enum GearSetupTypes {
	Melee = 'melee',
	Mage = 'mage',
	Range = 'range'
}

export interface GearSlotItem {
	item: number;
	quantity: number;
}

export type GearSetup = {
	[key in EquipmentSlot]: GearSlotItem | null;
};
