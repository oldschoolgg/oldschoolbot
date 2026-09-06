import { Emoji } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { ShootingStarsOptions } from '@/lib/types/minions.js';
import { sendServerNotification } from '@/lib/util/serverNotification.js';
import { starSizes } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsOptions, { handleTripFinish, user }) {
		const star = starSizes.find(i => i.size === data.size)!;
		const { usersWith } = data;
		const itemsToAdd = new Bank(data.lootItems);
		const userMiningLevel = user.skillsAsLevels.mining;

		if (itemsToAdd.has('Rock golem')) {
			sendServerNotification({
				user,
				item: 'Rock golem',
				quantity: itemsToAdd.amount('Rock golem'),
				action: 'mining',
				activity: 'a fallen Shooting Star',
				level: userMiningLevel,
				skill: 'Mining',
				emoji: Emoji.Mining
			});
		}

		await user.transactItems({ itemsToAdd, collectionLog: true });
		const xpStr = await user.addXP({
			skillName: 'mining',
			amount: data.totalXp,
			duration: data.duration
		});

		const str = `${user}, ${user.minionName} finished mining a size ${star.size} Crashed Star, there was ${
			usersWith - 1 || 'no'
		} other players mining with you.\nYou received ${itemsToAdd}.\n${xpStr}`;

		handleTripFinish({ user, channelId: data.channelId, message: str, data, loot: itemsToAdd });
	}
};
