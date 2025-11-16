import { Emoji, Events } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { ShootingStarsOptions } from '@/lib/types/minions.js';
import { starSizes } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsOptions, { handleTripFinish, user }) {
		const star = starSizes.find(i => i.size === data.size)!;
		const { usersWith } = data;
		const itemsToAdd = new Bank(data.lootItems);
		const userMiningLevel = user.skillsAsLevels.mining;

		await user.transactItems({ itemsToAdd, collectionLog: true });
		const xpStr = await user.addXP({
			skillName: 'mining',
			amount: data.totalXp,
			duration: data.duration
		});

		const str = `${user}, ${user.minionName} finished mining a size ${star.size} Crashed Star, there was ${
			usersWith - 1 || 'no'
		} other players mining with you.\nYou received ${itemsToAdd}.\n${xpStr}`;
		if (itemsToAdd.has('Rock golem')) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.badgedUsername}'s** minion, ${user.minionName}, just received ${
					itemsToAdd.amount('Rock golem') > 1 ? `${itemsToAdd.amount('Rock golem')}x ` : 'a'
				} Rock golem while mining a fallen Shooting Star at level ${userMiningLevel} Mining!`
			);
		}

		handleTripFinish({ user, channelId: data.channelId, message: str, data, loot: itemsToAdd });
	}
};
