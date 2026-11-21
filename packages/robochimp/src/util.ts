import type { PatronTier, RoboChimpBit as RoboChimpBitValue } from '@oldschoolgg/toolkit';
import {
	RoboChimpBit,
	roboChimpBitData,
	cyrTiers as sharedCyrTiers,
	magnaTiers as sharedMagnaTiers,
	paidTiers as sharedPaidTiers,
	allPatronBits as sharedPatronBits
} from '@oldschoolgg/toolkit';

export type { PaidTierSource, PatronTier } from '@oldschoolgg/toolkit';
export { formatUserPaidTiers, getPatronTierLabel, getUserPaidTiers, hasCyrPerkTier } from '@oldschoolgg/toolkit';

export const Bits = RoboChimpBit;
export type Bits = RoboChimpBitValue;
export const bitsDescriptions = roboChimpBitData;

export const allPatronBits: number[] = [...sharedPatronBits];
export const magnaTiers: PatronTier[] = [...sharedMagnaTiers];
export const cyrTiers: PatronTier[] = [...sharedCyrTiers];
export const paidTiers: PatronTier[] = [...sharedPaidTiers];
export const tiers = magnaTiers;

export { CHANNELS } from '@oldschoolgg/toolkit';
