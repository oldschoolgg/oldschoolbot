export const GearSetupTypes = ['melee', 'range', 'mage', 'misc', 'skilling', 'wildy', 'fashion', 'other'] as const;

export type GearSetupType = (typeof GearSetupTypes)[number];

export const PrimaryGearSetupTypes = ['melee', 'range', 'mage'] as const;
export type PrimaryGearSetupType = (typeof PrimaryGearSetupTypes)[number];
