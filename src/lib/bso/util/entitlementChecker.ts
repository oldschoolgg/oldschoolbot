import { findGroupOfUser } from '@/lib/bso/util/findGroupOfUser.js';

import { RoboChimpBit } from '@oldschoolgg/toolkit';

import { srcMUserFetch } from '@/lib/user/MUser.js';

export type Entitlement = {
	perkTier: number;
	bitfield: number;
};

export type EntitlementCheckResult = {
	success: boolean;
	authorized_user: string | null;
	entitlement: Partial<Entitlement> | null;
};

const robochimpTierBitfields: number[][] = [
	[
		RoboChimpBit.CyrTier0,
		RoboChimpBit.CyrTier1,
		RoboChimpBit.CyrTier2,
		RoboChimpBit.CyrTier3,
		RoboChimpBit.CyrTier4,
		RoboChimpBit.CyrTier5,
		RoboChimpBit.CyrTier6,
		RoboChimpBit.CyrTier7
	],
	[
		RoboChimpBit.MagnaTier1,
		RoboChimpBit.MagnaTier2,
		RoboChimpBit.MagnaTier3,
		RoboChimpBit.MagnaTier4,
		RoboChimpBit.MagnaTier5,
		RoboChimpBit.MagnaTier6
	]
];

function hasBitfieldEntitlement(ownedBitfields: number[], requiredBitfield: number) {
	const tierBitfields = robochimpTierBitfields.find(bitfields => bitfields.includes(requiredBitfield));
	const eligibleBitfields = tierBitfields
		? tierBitfields.slice(tierBitfields.indexOf(requiredBitfield))
		: [requiredBitfield];
	return eligibleBitfields.some(bitfield => ownedBitfields.includes(bitfield));
}

export async function checkEntitlements(
	user: MUser,
	entitlements: Partial<Entitlement>[],
	{ checkGroupedUsers = true }: { checkGroupedUsers?: boolean } = {}
): Promise<EntitlementCheckResult> {
	const userIds = checkGroupedUsers ? await findGroupOfUser(user.id) : [user.id];
	const users = await Promise.all(userIds.map(userId => (userId === user.id ? user : srcMUserFetch(userId))));
	const needsPerkTier = entitlements.some(entitlement => entitlement.perkTier !== undefined);
	const needsBitfield = entitlements.some(entitlement => entitlement.bitfield !== undefined);

	for (const eligibleUser of users) {
		const [perkTier, robochimpUser] = await Promise.all([
			needsPerkTier ? eligibleUser.fetchPerkTier() : null,
			needsBitfield ? Cache.getRoboChimpUser(eligibleUser.id) : null
		]);
		for (const entitlement of entitlements) {
			const hasRequirements = entitlement.perkTier !== undefined || entitlement.bitfield !== undefined;
			const matchesPerkTier = entitlement.perkTier === undefined || perkTier! >= entitlement.perkTier;
			const matchesBitfield =
				entitlement.bitfield === undefined || hasBitfieldEntitlement(robochimpUser!.bits, entitlement.bitfield);
			if (hasRequirements && matchesPerkTier && matchesBitfield) {
				return {
					success: true,
					authorized_user: eligibleUser.id,
					entitlement: { ...entitlement }
				};
			}
		}
	}

	return { success: false, authorized_user: null, entitlement: null };
}
