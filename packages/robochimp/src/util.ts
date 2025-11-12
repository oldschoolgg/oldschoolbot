import { PerkTier } from '@oldschoolgg/toolkit';

export enum Bits {
	Admin = 1,
	Mod = 2,
	Trusted = 3,
	WikiContributor = 4,
	IsContributor = 5,
	BothBotsMaxedPatronPerks = 6,
	HasPermanentTierOne = 7,
	IsPatronTier1 = 8,
	IsPatronTier2 = 9,
	IsPatronTier3 = 10,
	IsPatronTier4 = 11,
	IsPatronTier5 = 12,
	IsPatronTier6 = 13,
	HasEverBeenPatron = 14
}
type BitDescriptions = {
	[K in Bits]: { description: string };
};

export const bitsDescriptions: BitDescriptions = {
	[Bits.Admin]: { description: 'Admin' },
	[Bits.Mod]: { description: 'Moderator' },
	[Bits.Trusted]: { description: 'Trusted' },
	[Bits.WikiContributor]: { description: 'Wiki Contributor' },
	[Bits.IsContributor]: { description: 'Contributor' },
	[Bits.BothBotsMaxedPatronPerks]: { description: 'Maxed patron perks for both bots' },
	[Bits.HasPermanentTierOne]: { description: 'Has permanent Tier 1 perks' },
	[Bits.IsPatronTier1]: { description: 'Tier 1 patron' },
	[Bits.IsPatronTier2]: { description: 'Tier 2 patron' },
	[Bits.IsPatronTier3]: { description: 'Tier 3 patron' },
	[Bits.IsPatronTier4]: { description: 'Tier 4 patron' },
	[Bits.IsPatronTier5]: { description: 'Tier 5 patron' },
	[Bits.IsPatronTier6]: { description: 'Tier 6 patron' },
	[Bits.HasEverBeenPatron]: { description: 'Has been a patron before' }
};

export const CHANNELS = {
	BLACKLIST_LOGS: '782459317218967602',
	MODERATORS_OTHER: '830145040495411210',
	MODERATORS: '655880227469131777',
	TESTING_AWARDS: '1195579189714243685'
};

enum PatronTierID {
	One = '4608201',
	Two = '4608226',
	Three = '4720356',
	Four = '5262065',
	Five = '5262216',
	Six = '8091554'
}

export interface PatronTier {
	id: PatronTierID;
	bit: Bits;
	perkTier: PerkTier;
	number: number;
}

export const tiers: PatronTier[] = [
	{ id: PatronTierID.Six, bit: Bits.IsPatronTier6, perkTier: PerkTier.Seven, number: 6 },
	{ id: PatronTierID.Five, bit: Bits.IsPatronTier5, perkTier: PerkTier.Six, number: 5 },
	{ id: PatronTierID.Four, bit: Bits.IsPatronTier4, perkTier: PerkTier.Five, number: 4 },
	{ id: PatronTierID.Three, bit: Bits.IsPatronTier3, perkTier: PerkTier.Four, number: 3 },
	{ id: PatronTierID.Two, bit: Bits.IsPatronTier2, perkTier: PerkTier.Three, number: 2 },
	{ id: PatronTierID.One, bit: Bits.IsPatronTier1, perkTier: PerkTier.Two, number: 1 }
];

export const allPatronBits = tiers.map(t => t.bit);
