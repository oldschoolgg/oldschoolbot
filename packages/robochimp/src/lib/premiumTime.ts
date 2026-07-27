import { formatDuration, Time } from '@oldschoolgg/toolkit';
import type { Prisma } from '@prisma/robochimp';

type PremiumTimeClient = typeof roboChimpClient | Prisma.TransactionClient;

export const validPremiumTimeTiers = [1, 2, 3, 4, 5, 6, 7] as const;

export type PremiumTimeBalance = {
	premium_balance_tier: number | null;
	premium_balance_expiry_date: bigint | null;
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
	return roboChimpClient.user.findUniqueOrThrow({
		where: {
			id: userID
		},
		select: {
			premium_balance_tier: true,
			premium_balance_expiry_date: true
		}
	});
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
	const currentBalanceTime =
		currentBalance.premium_balance_expiry_date === null ? null : Number(currentBalance.premium_balance_expiry_date);
	const expiryTime =
		currentBalanceTime !== null && tier === currentBalance.premium_balance_tier
			? currentBalanceTime + timeMs
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

export function formatPremiumTimeGrant(grant: PremiumTimeGrant) {
	return `${formatDuration(grant.timeMs)} of Tier ${grant.tier}`;
}
