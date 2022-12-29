import { BitField, PatronTierID } from './constants';

export const tiers: [PatronTierID, BitField][] = [
	[PatronTierID.Six, BitField.IsPatronTier6],
	[PatronTierID.Five, BitField.IsPatronTier5],
	[PatronTierID.Four, BitField.IsPatronTier4],
	[PatronTierID.Three, BitField.IsPatronTier3],
	[PatronTierID.Two, BitField.IsPatronTier2],
	[PatronTierID.One, BitField.IsPatronTier1]
];
