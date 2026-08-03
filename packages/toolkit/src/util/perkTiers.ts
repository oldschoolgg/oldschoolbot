import { formatDuration } from './datetime.js';
import { PerkTier } from './misc.js';

export const RoboChimpBit = {
	Admin: 1,
	Moderator: 2,
	Trusted: 3,
	WikiContributor: 4,
	Contributor: 5,
	BothBotsMaxedFreeTierOnePerks: 6,
	HasPermanentTierOne: 7,
	MagnaTier1: 8,
	MagnaTier2: 9,
	MagnaTier3: 10,
	MagnaTier4: 11,
	MagnaTier5: 12,
	MagnaTier6: 13,
	HasEverBeenPatron: 14,
	SupportStaff: 15,
	CyrTier0: 16,
	CyrTier1: 17,
	CyrTier2: 18,
	CyrTier3: 19,
	CyrTier4: 20,
	CyrTier5: 21,
	CyrTier6: 22,
	CyrTier7: 23,
	CyrsOriginalPatrons: 24,
	BonusMinute: 25
} as const;

export type RoboChimpBit = (typeof RoboChimpBit)[keyof typeof RoboChimpBit];
export type RoboChimpBitDescription = {
	description: string;
};
export const roboChimpBitData: Record<RoboChimpBit, RoboChimpBitDescription> = {
	[RoboChimpBit.Admin]: { description: 'Admin' },
	[RoboChimpBit.Moderator]: { description: 'Moderator' },
	[RoboChimpBit.SupportStaff]: { description: 'Support Staff' },
	[RoboChimpBit.Trusted]: { description: 'Trusted' },
	[RoboChimpBit.WikiContributor]: { description: 'Wiki Contributor' },
	[RoboChimpBit.Contributor]: { description: 'Contributor' },
	[RoboChimpBit.BothBotsMaxedFreeTierOnePerks]: { description: 'Maxed patron perks for both bots' },
	[RoboChimpBit.HasPermanentTierOne]: { description: 'Has permanent Tier 1 perks' },
	[RoboChimpBit.MagnaTier1]: { description: 'Magna Tier 1 patron' },
	[RoboChimpBit.MagnaTier2]: { description: 'Magna Tier 2 patron' },
	[RoboChimpBit.MagnaTier3]: { description: 'Magna Tier 3 patron' },
	[RoboChimpBit.MagnaTier4]: { description: 'Magna Tier 4 patron' },
	[RoboChimpBit.MagnaTier5]: { description: 'Magna Tier 5 patron' },
	[RoboChimpBit.MagnaTier6]: { description: 'Magna Tier 6 patron' },
	[RoboChimpBit.HasEverBeenPatron]: { description: 'Has been a patron before' },
	[RoboChimpBit.CyrTier0]: { description: 'Cyr Tier 0 patron' },
	[RoboChimpBit.CyrTier1]: { description: 'Cyr Tier 1 patron' },
	[RoboChimpBit.CyrTier2]: { description: 'Cyr Tier 2 patron' },
	[RoboChimpBit.CyrTier3]: { description: 'Cyr Tier 3 patron' },
	[RoboChimpBit.CyrTier4]: { description: 'Cyr Tier 4 patron' },
	[RoboChimpBit.CyrTier5]: { description: 'Cyr Tier 5 patron' },
	[RoboChimpBit.CyrTier6]: { description: 'Cyr Tier 6 patron' },
	[RoboChimpBit.CyrTier7]: { description: 'Cyr Tier 7 patron' },
	[RoboChimpBit.CyrsOriginalPatrons]: { description: "Cyr's original patron" },
	[RoboChimpBit.BonusMinute]: { description: 'Bonus minute?' }
};

export type PaidTierSource = 'magna' | 'cyr';

export type PatronTier = {
	id?: string;
	bit: number;
	perkTier: PerkTier;
	number: number;
	source: PaidTierSource;
};

type PerkTierExpiry = {
	date: Date;
	ttl: bigint;
};

export type PatreonPerk = {
	tier: PerkTier;
	source: 'patreon';
	beneficiary: PaidTierSource;
	bit: number;
	patronTier: number;
};

export type PremiumPerk = {
	tier: PerkTier;
	source: 'premium';
	expires: PerkTierExpiry;
};

export type LocalPerk = {
	tier: PerkTier;
	source: 'courtesy' | 'legacy';
};

export type PerkTierEntitlement = PatreonPerk | PremiumPerk | LocalPerk;

export type PerkTierInput = {
	patreonBits: number[] | null | undefined;
	premiumTier?: PerkTier | number | null;
	premiumExpiry?: bigint | number | Date | null;
	premiumEntitlements?: Array<{
		tier: PerkTier | number | null | undefined;
		expiry: bigint | number | Date | null | undefined;
	}>;
};

export type PerkTierOptions = {
	courtesyTier?: PerkTier | number | null;
	legacyTier?: PerkTier | number | null;
	now?: number;
};

enum MagnaTierID {
	One = '4608201',
	Two = '4608226',
	Three = '4720356',
	Four = '5262065',
	Five = '5262216',
	Six = '8091554'
}

export const magnaTiers: PatronTier[] = [
	{
		id: MagnaTierID.Six,
		bit: RoboChimpBit.MagnaTier6,
		perkTier: PerkTier.Seven,
		number: 6,
		source: 'magna'
	},
	{
		id: MagnaTierID.Five,
		bit: RoboChimpBit.MagnaTier5,
		perkTier: PerkTier.Six,
		number: 5,
		source: 'magna'
	},
	{
		id: MagnaTierID.Four,
		bit: RoboChimpBit.MagnaTier4,
		perkTier: PerkTier.Five,
		number: 4,
		source: 'magna'
	},
	{
		id: MagnaTierID.Three,
		bit: RoboChimpBit.MagnaTier3,
		perkTier: PerkTier.Four,
		number: 3,
		source: 'magna'
	},
	{
		id: MagnaTierID.Two,
		bit: RoboChimpBit.MagnaTier2,
		perkTier: PerkTier.Three,
		number: 2,
		source: 'magna'
	},
	{
		id: MagnaTierID.One,
		bit: RoboChimpBit.MagnaTier1,
		perkTier: PerkTier.Two,
		number: 1,
		source: 'magna'
	}
] as PatronTier[];

export const cyrTiers: PatronTier[] = [
	{ bit: RoboChimpBit.CyrTier7, perkTier: PerkTier.Seven, number: 7, source: 'cyr' },
	{ bit: RoboChimpBit.CyrTier6, perkTier: PerkTier.Seven, number: 6, source: 'cyr' },
	{ bit: RoboChimpBit.CyrTier5, perkTier: PerkTier.Six, number: 5, source: 'cyr' },
	{ bit: RoboChimpBit.CyrTier4, perkTier: PerkTier.Five, number: 4, source: 'cyr' },
	{ bit: RoboChimpBit.CyrTier3, perkTier: PerkTier.Four, number: 3, source: 'cyr' },
	{ bit: RoboChimpBit.CyrTier2, perkTier: PerkTier.Three, number: 2, source: 'cyr' },
	{ bit: RoboChimpBit.CyrTier1, perkTier: PerkTier.Two, number: 1, source: 'cyr' },
	{ bit: RoboChimpBit.CyrTier0, perkTier: PerkTier.One, number: 0, source: 'cyr' }
] as PatronTier[];

export const paidTiers: PatronTier[] = [...magnaTiers, ...cyrTiers];
export const allPatronBits: number[] = paidTiers.map(tier => tier.bit);

function normalizeExpiry(expiry: bigint | number | Date | null | undefined): number | null {
	if (expiry instanceof Date) return expiry.getTime();
	if (typeof expiry === 'bigint') return Number(expiry);
	if (typeof expiry === 'number') return expiry;
	return null;
}

function bestTier(details: PerkTierEntitlement[]): PerkTierEntitlement | null {
	return (
		[...details].sort((a, b) => {
			if (b.tier !== a.tier) return b.tier - a.tier;
			const order: Record<PerkTierEntitlement['source'], number> = {
				patreon: 4,
				premium: 3,
				courtesy: 2,
				legacy: 1
			};
			return order[b.source] - order[a.source];
		})[0] ?? null
	);
}

export function getPatronTierLabel(tier: Pick<PatronTier, 'source' | 'number'>): string {
	return `${tier.source === 'cyr' ? 'Cyr' : 'Magna'} Tier ${tier.number}`;
}

export function getUserPaidTiers(bits: number[] | null | undefined): PatronTier[] {
	if (!bits) return [];
	return paidTiers.filter(tier => bits.includes(tier.bit));
}

export function formatUserPaidTiers(bits: number[] | null | undefined): string {
	const labels = getUserPaidTiers(bits)
		.sort((a, b) => {
			if (b.perkTier !== a.perkTier) return b.perkTier - a.perkTier;
			if (a.source !== b.source) return a.source === 'cyr' ? -1 : 1;
			return b.number - a.number;
		})
		.map(getPatronTierLabel);
	return labels.length === 0 ? 'None' : labels.join(', ');
}

export function getCyrTripBonus(bits: number[] | null | undefined): number {
	if (!bits || bits.length === 0) return PerkTier.Zero;
	const highestTier = cyrTiers.find(tier => bits.includes(tier.bit))?.number;
	if (highestTier === undefined) return PerkTier.Zero;
	if (highestTier >= 3) return 15 * 60 * 1000;
	if (highestTier === 2) return 10 * 60 * 1000;
	if (highestTier === 1) return 6 * 60 * 1000;
	return 3 * 60 * 1000;
}

export function getPerkTierDetails(user: PerkTierInput, options: PerkTierOptions = {}): PerkTierEntitlement[] {
	const now = options.now ?? Date.now();
	const details: PerkTierEntitlement[] = getUserPaidTiers(user.patreonBits).map(tier => ({
		tier: tier.perkTier,
		source: 'patreon',
		beneficiary: tier.source,
		bit: tier.bit,
		patronTier: tier.number
	}));

	const premiumEntitlements =
		user.premiumEntitlements ??
		(user.premiumTier && user.premiumExpiry ? [{ tier: user.premiumTier, expiry: user.premiumExpiry }] : []);
	for (const premium of premiumEntitlements) {
		const premiumExpiry = normalizeExpiry(premium.expiry);
		if (premium.tier && premiumExpiry && premiumExpiry > now) {
			details.push({
				tier: premium.tier as PerkTier,
				source: 'premium',
				expires: {
					date: new Date(premiumExpiry),
					ttl: BigInt(Math.max(0, premiumExpiry - now))
				}
			});
		}
	}

	if (options.courtesyTier && options.courtesyTier > 0) {
		details.push({ tier: options.courtesyTier as PerkTier, source: 'courtesy' });
	}

	if (options.legacyTier && options.legacyTier > 0) {
		details.push({ tier: options.legacyTier as PerkTier, source: 'legacy' });
	}

	return details.sort((a, b) => b.tier - a.tier);
}

export function getPerkTierEx(user: PerkTierInput, options?: PerkTierOptions): PerkTier {
	return bestTier(getPerkTierDetails(user, options))?.tier ?? PerkTier.Zero;
}

export function getPerkTierDisplay(user: PerkTierInput, options?: PerkTierOptions): string {
	const details = getPerkTierDetails(user, options);
	const patreonTier = Math.max(
		PerkTier.Zero,
		...details.filter(tier => tier.source === 'patreon').map(tier => tier.tier)
	);
	const premiumTiers = details.filter((tier): tier is PremiumPerk => tier.source === 'premium');
	const premium = premiumTiers[0];
	const courtesyTier = Math.max(
		PerkTier.Zero,
		...details.filter(tier => tier.source === 'courtesy').map(tier => tier.tier)
	);
	const legacyTier = Math.max(
		PerkTier.Zero,
		...details.filter(tier => tier.source === 'legacy').map(tier => tier.tier)
	);

	if (premium && premium.tier > patreonTier && premium.tier >= courtesyTier && premium.tier >= legacyTier) {
		return premiumTiers
			.map((tier, index) => {
				const tierLabel = `Tier ${tier.tier - 1}`;
				return `Temp Tier: ${index === 0 ? `**${tierLabel}**` : tierLabel} (Expires: ${tier.expires.date.toISOString()}, ${formatDuration(Number(tier.expires.ttl))} remaining)`;
			})
			.join(', ');
	}

	if (courtesyTier > patreonTier && courtesyTier > (premium?.tier ?? PerkTier.Zero) && courtesyTier >= legacyTier) {
		return `**Courtesy** __Tier ${courtesyTier - 1}__`;
	}

	if (legacyTier > patreonTier && legacyTier > (premium?.tier ?? PerkTier.Zero) && legacyTier > courtesyTier) {
		return `🔴 **Legacy** __Tier ${legacyTier - 1}__`;
	}

	const paidTierDisplay = formatUserPaidTiers(user.patreonBits);
	if (paidTierDisplay !== 'None') return paidTierDisplay;

	return 'None';
}
