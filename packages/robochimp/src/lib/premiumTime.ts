import { formatDuration, Time } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/robochimp';

type PremiumTimeClient = typeof roboChimpClient | Prisma.TransactionClient;

export const validPremiumTimeTiers = [1, 2, 3, 4, 5, 6, 7] as const;

export type PremiumTimeBalance = {
	premium_balance_tier: number | null;
	premium_balance_expiry_date: bigint | null;
	is_active?: boolean | null;
};

export type PremiumTimeGrant = {
	expiryTime: number;
	remainingTime: number;
	tier: number;
	timeMs: number;
};

export function validatePremiumTimeGrant(timeMs: number, tier: number) {
	return (
		validPremiumTimeTiers.includes(tier as (typeof validPremiumTimeTiers)[number]) &&
		timeMs >= Time.Second &&
		timeMs <= Time.Year * 3
	);
}

export async function fetchPremiumTimeBalance(userID: bigint): Promise<PremiumTimeBalance> {
	const premiumTime: PremiumTimeBalance = await roboChimpClient.user.findUniqueOrThrow({
		where: {
			id: userID
		},
		select: {
			premium_balance_tier: true,
			premium_balance_expiry_date: true
		}
	});
	// Check is the premium balance is still active; expired perks don't clear these fields, so we must check:
	if ((premiumTime.premium_balance_expiry_date ?? 0) > Date.now() && premiumTime.premium_balance_tier) {
		premiumTime.is_active = true;
	}
	return premiumTime;
}

export function calculatePremiumTimeGrant({
	currentBalance,
	timeMs,
	tier,
	now = Date.now()
}: {
	currentBalance: PremiumTimeBalance;
	timeMs: number;
	tier: number;
	now?: number;
}): PremiumTimeGrant {
	const currentExpiryDate =
		currentBalance.premium_balance_expiry_date === null ? null : Number(currentBalance.premium_balance_expiry_date);

	// If not yet expired, AND the tier is the same, then time stacks, otherwise it resets.
	const expiryTime =
		currentExpiryDate && now < currentExpiryDate && tier === currentBalance.premium_balance_tier
			? currentExpiryDate + timeMs
			: now + timeMs;

	return {
		expiryTime,
		remainingTime: expiryTime - now,
		tier,
		timeMs
	};
}

export function premiumTimeGrantUpdate(grant: PremiumTimeGrant) {
	return {
		premium_balance_tier: grant.tier,
		premium_balance_expiry_date: grant.expiryTime
	};
}

export async function applyPremiumTimeGrant({
	client = roboChimpClient,
	userID,
	grant
}: {
	client?: PremiumTimeClient;
	userID: bigint;
	grant: PremiumTimeGrant;
}) {
	return client.user.update({
		where: {
			id: userID
		},
		data: premiumTimeGrantUpdate(grant)
	});
}

export async function grantPremiumTime({
	userID,
	timeMs,
	tier,
	now = Date.now()
}: {
	userID: bigint;
	timeMs: number;
	tier: number;
	now?: number;
}) {
	if (!validatePremiumTimeGrant(timeMs, tier)) {
		throw new Error('Invalid temporary premium grant.');
	}

	const currentBalance = await fetchPremiumTimeBalance(userID);
	const grant = calculatePremiumTimeGrant({ currentBalance, timeMs, tier, now });

	await applyPremiumTimeGrant({ userID, grant });
	await globalClient.fetchRUser(userID);
	return grant;
}

export function formatPremiumTimeGrant(grant: PremiumTimeGrant, displayPremium = true) {
	const displayTier = displayPremium ? grant.tier - 1 : grant.tier;
	return `${formatDuration(grant.timeMs)} of Tier ${displayTier}`;
}
