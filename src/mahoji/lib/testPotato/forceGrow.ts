import { Time } from '@oldschoolgg/toolkit';

import { getFarmingKeyFromName, userGrowingProgressStr } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import { getFarmingInfoFromUser } from '@/lib/skilling/skills/farming/utils/getFarmingInfo.js';
import type { SafeUserUpdateInput } from '@/lib/user/update.js';

export async function handleTestPotatoForceGrow(user: MUser, patchName: string) {
	if (patchName === 'birdhouses') {
		const birdhouseData = user.fetchBirdhouseData();
		await user.updateBirdhouseData({
			...birdhouseData,
			birdhouseTime: Date.now() - Time.Month
		});
		return 'Your birdhouses have been forced to be fully grown.';
	}
	const farmingDetails = await getFarmingInfoFromUser(user);
	const patchesToGrow =
		patchName === 'all'
			? farmingDetails.patchesDetailed.filter(patch => patch.plant)
			: farmingDetails.patchesDetailed.filter(patch => patch.patchName === patchName && patch.plant);
	if (patchesToGrow.length === 0) {
		return patchName === 'all' ? 'You have nothing planted in any patches.' : 'You have nothing planted there.';
	}
	const now = Date.now();
	const updates: SafeUserUpdateInput = Object.fromEntries(
		patchesToGrow.map(patch => [
			getFarmingKeyFromName(patch.patchName),
			{
				...farmingDetails.patches[patch.patchName],
				plantTime: now - Time.Month
			}
		])
	);

	await user.update(updates);
	return userGrowingProgressStr((await getFarmingInfoFromUser(user)).patchesDetailed, user);
}
