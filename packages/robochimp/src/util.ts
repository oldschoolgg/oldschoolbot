import { PerkTier } from '@oldschoolgg/toolkit';

export enum Bits {
	Admin = 1,
	Moderator = 2,
	Trusted = 3,
	WikiContributor = 4,
	Contributor = 5,
	BothBotsMaxedFreeTierOnePerks = 6,
	HasPermanentTierOne = 7,
	PatronTier1 = 8,
	PatronTier2 = 9,
	PatronTier3 = 10,
	PatronTier4 = 11,
	PatronTier5 = 12,
	PatronTier6 = 13,
	HasEverBeenPatron = 14,
	SupportStaff = 15
}
type BitDescriptions = {
	[K in Bits]: { description: string };
};

export const bitsDescriptions: BitDescriptions = {
	[Bits.Admin]: { description: 'Admin' },
	[Bits.Moderator]: { description: 'Moderator' },
	[Bits.SupportStaff]: { description: 'Support Staff' },
	[Bits.Trusted]: { description: 'Trusted' },
	[Bits.WikiContributor]: { description: 'Wiki Contributor' },
	[Bits.Contributor]: { description: 'Contributor' },
	[Bits.BothBotsMaxedFreeTierOnePerks]: { description: 'Maxed patron perks for both bots' },
	[Bits.HasPermanentTierOne]: { description: 'Has permanent Tier 1 perks' },
	[Bits.PatronTier1]: { description: 'Tier 1 patron' },
	[Bits.PatronTier2]: { description: 'Tier 2 patron' },
	[Bits.PatronTier3]: { description: 'Tier 3 patron' },
	[Bits.PatronTier4]: { description: 'Tier 4 patron' },
	[Bits.PatronTier5]: { description: 'Tier 5 patron' },
	[Bits.PatronTier6]: { description: 'Tier 6 patron' },
	[Bits.HasEverBeenPatron]: { description: 'Has been a patron before' }
};

export const CHANNELS = {
	BLACKLIST_LOGS: '782459317218967602',
	MODERATORS_OTHER: '830145040495411210',
	MODERATORS: '655880227469131777',
	TESTING_AWARDS: '1195579189714243685',
	DEVELOPERS: '648196527294251020',
	ALL_SUPPORT_STAFF: '1482212223085580442',
	MODERATORS_COMMANDS: '1457789366330986608'
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
	{ id: PatronTierID.Six, bit: Bits.PatronTier6, perkTier: PerkTier.Seven, number: 6 },
	{ id: PatronTierID.Five, bit: Bits.PatronTier5, perkTier: PerkTier.Six, number: 5 },
	{ id: PatronTierID.Four, bit: Bits.PatronTier4, perkTier: PerkTier.Five, number: 4 },
	{ id: PatronTierID.Three, bit: Bits.PatronTier3, perkTier: PerkTier.Four, number: 3 },
	{ id: PatronTierID.Two, bit: Bits.PatronTier2, perkTier: PerkTier.Three, number: 2 },
	{ id: PatronTierID.One, bit: Bits.PatronTier1, perkTier: PerkTier.Two, number: 1 }
];

export const allPatronBits: Bits[] = tiers.map(t => t.bit);
