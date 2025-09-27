import { Emoji, Events } from '@oldschoolgg/toolkit/constants';
import { Bank } from 'oldschooljs';

import type { ShootingStarsOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { starSizes } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

export async function shootingStarsActivity(data: ShootingStarsOptions) {
	const user = await mUserFetch(data.userID);
	const star = starSizes.find(i => i.size === data.size)!;
	const { usersWith } = data;
	const loot = new Bank(data.lootItems);
	const userMiningLevel = user.skillsAsLevels.mining;

	await user.addItemsToBank({ items: loot, collectionLog: true });
	const xpStr = await user.addXP({
		skillName: 'mining',
		amount: data.totalXp,
		duration: data.duration
	});

	const str = `${user}, ${user.minionName} finished mining a size ${star.size} Crashed Star, there was ${
		usersWith - 1 || 'no'
	} other players mining with you.\nYou received ${loot}.\n${xpStr}`;
	if (loot.has('Rock golem')) {
		globalClient.emit(
			Events.ServerNotification,
			`${Emoji.Mining} **${user.badgedUsername}'s** minion, ${user.minionName}, just received ${
				loot.amount('Rock golem') > 1 ? `${loot.amount('Rock golem')}x ` : 'a'
			} Rock golem while mining a fallen Shooting Star at level ${userMiningLevel} Mining!`
		);
	}

	handleTripFinish(user, data.channelID, str, undefined, data, loot);
}
