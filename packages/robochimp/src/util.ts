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
export { formatUserPaidTiers, getPatronTierLabel, getUserPaidTiers } from '@oldschoolgg/toolkit';

export const Bits = RoboChimpBit;
export type Bits = RoboChimpBitValue;
export const bitsDescriptions = roboChimpBitData;

export const allPatronBits: number[] = [...sharedPatronBits];
export const magnaTiers: PatronTier[] = [...sharedMagnaTiers];
export const cyrTiers: PatronTier[] = [...sharedCyrTiers];
export const paidTiers: PatronTier[] = [...sharedPaidTiers];
export const tiers = magnaTiers;

export const CHANNELS = {
	BLACKLIST_LOGS: '782459317218967602',
	MODERATORS_OTHER: '830145040495411210',
	MODERATORS: '655880227469131777',
	TESTING_AWARDS: '1195579189714243685',
	DEVELOPERS: '648196527294251020',
	ALL_SUPPORT_STAFF: '1482212223085580442',
	MODERATORS_COMMANDS: '1457789366330986608'
};
