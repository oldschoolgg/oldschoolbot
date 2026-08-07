import { formatDuration, Time } from '@oldschoolgg/toolkit';

import { getUsersPerkTier } from '@/lib/perkTiers.js';

export async function premiumPatronTime(
	timeMs: number,
	tier: number,
	userToGive: MUser,
	interaction: MInteraction | null
) {
	if (![1, 2, 3, 4, 5, 6, 7].includes(tier)) return 'Invalid input.';
	if (timeMs < Time.Second || timeMs > Time.Year * 3) return 'Invalid input.';

	const currentUser = await roboChimpClient.user.upsert({
		where: {
			id: BigInt(userToGive.id)
		},
		create: {
			id: BigInt(userToGive.id)
		},
		update: {}
	});
	const currentBalanceTier = currentUser.premium_balance_tier;

	if (interaction && currentBalanceTier !== null && currentBalanceTier !== tier) {
		await interaction.confirmation(
			`They already have Tier ${currentBalanceTier}; this will replace the existing balance entirely, are you sure?`
		);
	}

	if (interaction) {
		await interaction.confirmation(
			`Are you sure you want to add ${formatDuration(timeMs)} of Tier ${tier} patron to ${userToGive}?`
		);
	}

	const currentBalanceTime =
		currentUser.premium_balance_expiry_date === null ? null : Number(currentUser.premium_balance_expiry_date);

	const newBalanceExpiryTime =
		currentBalanceTime !== null && tier === currentBalanceTier ? currentBalanceTime + timeMs : Date.now() + timeMs;

	const updatedUser = await roboChimpClient.user.update({
		where: {
			id: BigInt(userToGive.id)
		},
		data: {
			premium_balance_tier: tier,
			premium_balance_expiry_date: newBalanceExpiryTime
		}
	});
	await Cache.setRoboChimpUser(userToGive.id, updatedUser);
	await getUsersPerkTier({ user: userToGive, forceNoCache: true });

	return `Gave ${formatDuration(timeMs)} of Tier ${tier} patron to ${userToGive}. They have ${formatDuration(
		newBalanceExpiryTime - Date.now()
	)} remaining.`;
}
