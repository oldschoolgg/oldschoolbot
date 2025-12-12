import { Time } from '@oldschoolgg/toolkit';

export async function premiumPatronTime(timeMs: number, tier: number, userToGive: MUser, interaction: MInteraction) {
	if (![1, 2, 3, 4, 5, 6].includes(tier)) return 'Invalid input.';
	if (timeMs < Time.Second || timeMs > Time.Year * 3) return 'Invalid input.';

	const currentBalanceTier = userToGive.user.premium_balance_tier;

	if (currentBalanceTier !== null && currentBalanceTier !== tier) {
		await interaction.confirmation(
			`They already have Tier ${currentBalanceTier}; this will replace the existing balance entirely, are you sure?`
		);
	}
	await interaction.confirmation(
		`Are you sure you want to add ${formatDuration(timeMs)} of Tier ${tier} patron to ${userToGive}?`
	);
	await userToGive.update({
		premium_balance_tier: tier
	});

	const currentBalanceTime =
		userToGive.user.premium_balance_expiry_date === null
			? null
			: Number(userToGive.user.premium_balance_expiry_date);

	let newBalanceExpiryTime = 0;
	if (currentBalanceTime !== null && tier === currentBalanceTier) {
		newBalanceExpiryTime = currentBalanceTime + timeMs;
	} else {
		newBalanceExpiryTime = Date.now() + timeMs;
	}
	await userToGive.update({
		premium_balance_expiry_date: newBalanceExpiryTime
	});

	return `Gave ${formatDuration(timeMs)} of Tier ${tier} patron to ${userToGive}. They have ${formatDuration(
		newBalanceExpiryTime - Date.now()
	)} remaining.`;
}
