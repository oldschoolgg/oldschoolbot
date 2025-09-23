import { Bank, SkillsEnum } from 'oldschooljs';

import type { ShootingStarsOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { starSizes } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

export async function shootingStarsActivity(data: ShootingStarsOptions) {
	const user = await mUserFetch(data.userID);
	const star = starSizes.find(i => i.size === data.size)!;
	const { usersWith } = data;
	const loot = new Bank(data.lootItems);

	await user.addItemsToBank({ items: loot, collectionLog: true });
	const xpStr = await user.addXP({
		skillName: SkillsEnum.Mining,
		amount: data.totalXp,
		duration: data.duration
	});

	const str = `${user}, ${user.minionName} finished mining a size ${star.size} Crashed Star, there was ${
		usersWith - 1 || 'no'
	} other players mining with you.\nYou received ${loot}.\n${xpStr}`;

	handleTripFinish(user, data.channelID, str, undefined, data, loot);
}
