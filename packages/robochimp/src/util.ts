import { PerkTier } from '@oldschoolgg/toolkit';

export enum Bits {
	Admin = 1,
	Moderator = 2,
	Trusted = 3,
	WikiContributor = 4,
	Contributor = 5,
	BothBotsMaxedFreeTierOnePerks = 6,
	HasPermanentTierOne = 7,
	MagnaPatronTier1 = 8,
	MagnaPatronTier2 = 9,
	MagnaPatronTier3 = 10,
	MagnaPatronTier4 = 11,
	MagnaPatronTier5 = 12,
	MagnaPatronTier6 = 13,
	HasEverBeenPatron = 14,
	SupportStaff = 15,
	CyrPatronTier0 = 16,
	CyrPatronTier1 = 17,
	CyrPatronTier2 = 18,
	CyrPatronTier3 = 19,
	CyrPatronTier4 = 20,
	CyrPatronTier5 = 21,
	CyrPatronTier6 = 22,
	CyrPatronTier7 = 23,
	PatronTier1 = MagnaPatronTier1,
	PatronTier2 = MagnaPatronTier2,
	PatronTier3 = MagnaPatronTier3,
	PatronTier4 = MagnaPatronTier4,
	PatronTier5 = MagnaPatronTier5,
	PatronTier6 = MagnaPatronTier6
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
	[Bits.MagnaPatronTier1]: { description: 'Magna Tier 1 patron' },
	[Bits.MagnaPatronTier2]: { description: 'Magna Tier 2 patron' },
	[Bits.MagnaPatronTier3]: { description: 'Magna Tier 3 patron' },
	[Bits.MagnaPatronTier4]: { description: 'Magna Tier 4 patron' },
	[Bits.MagnaPatronTier5]: { description: 'Magna Tier 5 patron' },
	[Bits.MagnaPatronTier6]: { description: 'Magna Tier 6 patron' },
	[Bits.HasEverBeenPatron]: { description: 'Has been a patron before' },
	[Bits.CyrPatronTier0]: { description: 'Cyr Tier 0 patron' },
	[Bits.CyrPatronTier1]: { description: 'Cyr Tier 1 patron' },
	[Bits.CyrPatronTier2]: { description: 'Cyr Tier 2 patron' },
	[Bits.CyrPatronTier3]: { description: 'Cyr Tier 3 patron' },
	[Bits.CyrPatronTier4]: { description: 'Cyr Tier 4 patron' },
	[Bits.CyrPatronTier5]: { description: 'Cyr Tier 5 patron' },
	[Bits.CyrPatronTier6]: { description: 'Cyr Tier 6 patron' },
	[Bits.CyrPatronTier7]: { description: 'Cyr Tier 7 patron' }
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

enum MagnaPatronTierID {
	One = '4608201',
	Two = '4608226',
	Three = '4720356',
	Four = '5262065',
	Five = '5262216',
	Six = '8091554'
}

export type PaidTierSource = 'magna' | 'cyr';

export interface PatronTier {
	id?: string;
	bit: Bits;
	perkTier: PerkTier;
	number: number;
	source: PaidTierSource;
}

export const magnaTiers: PatronTier[] = [
	{ id: MagnaPatronTierID.Six, bit: Bits.MagnaPatronTier6, perkTier: PerkTier.Seven, number: 6, source: 'magna' },
	{ id: MagnaPatronTierID.Five, bit: Bits.MagnaPatronTier5, perkTier: PerkTier.Six, number: 5, source: 'magna' },
	{ id: MagnaPatronTierID.Four, bit: Bits.MagnaPatronTier4, perkTier: PerkTier.Five, number: 4, source: 'magna' },
	{
		id: MagnaPatronTierID.Three,
		bit: Bits.MagnaPatronTier3,
		perkTier: PerkTier.Four,
		number: 3,
		source: 'magna'
	},
	{ id: MagnaPatronTierID.Two, bit: Bits.MagnaPatronTier2, perkTier: PerkTier.Three, number: 2, source: 'magna' },
	{ id: MagnaPatronTierID.One, bit: Bits.MagnaPatronTier1, perkTier: PerkTier.Two, number: 1, source: 'magna' }
];

export const cyrTiers: PatronTier[] = [
	{ bit: Bits.CyrPatronTier7, perkTier: PerkTier.Seven, number: 7, source: 'cyr' },
	{ bit: Bits.CyrPatronTier6, perkTier: PerkTier.Seven, number: 6, source: 'cyr' },
	{ bit: Bits.CyrPatronTier5, perkTier: PerkTier.Seven, number: 5, source: 'cyr' },
	{ bit: Bits.CyrPatronTier4, perkTier: PerkTier.Six, number: 4, source: 'cyr' },
	{ bit: Bits.CyrPatronTier3, perkTier: PerkTier.Five, number: 3, source: 'cyr' },
	{ bit: Bits.CyrPatronTier2, perkTier: PerkTier.Four, number: 2, source: 'cyr' },
	{ bit: Bits.CyrPatronTier1, perkTier: PerkTier.Three, number: 1, source: 'cyr' },
	{ bit: Bits.CyrPatronTier0, perkTier: PerkTier.Two, number: 0, source: 'cyr' }
];

export const tiers: PatronTier[] = magnaTiers;
export const paidTiers: PatronTier[] = [...magnaTiers, ...cyrTiers];
export const allPatronBits: Bits[] = paidTiers.map(t => t.bit);

export function getPatronTierLabel(tier: Pick<PatronTier, 'source' | 'number'>) {
	return `${tier.source === 'cyr' ? 'Cyr' : 'Magna'} Tier ${tier.number}`;
}

export function getUserPaidTiers(bits: readonly number[]): PatronTier[] {
	return paidTiers.filter(tier => bits.includes(tier.bit));
}

export function formatUserPaidTiers(bits: readonly number[]) {
	const labels = getUserPaidTiers(bits)
		.sort((a, b) => {
			if (b.perkTier !== a.perkTier) return b.perkTier - a.perkTier;
			if (a.source !== b.source) return a.source === 'cyr' ? -1 : 1;
			return b.number - a.number;
		})
		.map(getPatronTierLabel);
	return labels.length === 0 ? 'None' : labels.join(', ');
}
