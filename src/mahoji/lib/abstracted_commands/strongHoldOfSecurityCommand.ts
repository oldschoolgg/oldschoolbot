import { randomVariation } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, resolveItems } from 'oldschooljs';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export async function strongHoldOfSecurityCommand(user: MUser, channelID: string) {
	if (user.minionIsBusy) {
		return 'Your minion is busy.';
	}
	const count = await prisma.activity.count({
		where: {
			user_id: BigInt(user.id),
			type: 'StrongholdOfSecurity'
		}
	});
	const strongHoldBoots = resolveItems(['Fancy boots', 'Fighting boots', 'Fancier boots']);

	if (count !== 0) {
		const bootsBank = new Bank();
		for (const boots of strongHoldBoots) {
			if (!user.owns(boots)) {
				bootsBank.add(boots);
			}
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: bootsBank
		});

		return `You've already completed the Stronghold of Security!${bootsBank.length > 0 ? ` You reclaimed these items: ${bootsBank}.` : ''}`;
	}

	await ActivityManager.startTrip<ActivityTaskOptionsWithNoChanges>({
		userID: user.id,
		channelID,
		duration: randomVariation(Time.Minute * 10, 5),
		type: 'StrongholdOfSecurity'
	});

	return `${user.minionName} is now doing the Stronghold of Security!`;
}
