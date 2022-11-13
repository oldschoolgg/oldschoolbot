import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { starSizes } from '../../../lib/data/shootingStars';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ShootingStarsData } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export async function shootingStarsActivity(data: ShootingStarsData) {
	const user = await mUserFetch(data.userID);
	const star = starSizes.find(i => i.size === data.size)!;
	const { usersWith } = data;
	const loot = new Bank(data.lootItems);
	const userMiningLevel = user.skillLevel(SkillsEnum.Mining);

	await user.addItemsToBank({ items: loot, collectionLog: true });
	const xpStr = await user.addXP({
		skillName: SkillsEnum.Mining,
		amount: data.totalXp,
		duration: data.duration
	});

	let str = `${user}, ${user.minionName} finished mining a size ${star.size} Crashed Star, there was ${
		usersWith - 1 || 'no'
	} other players mining with you.\nYou received ${loot}.\n${xpStr}`;
	if (loot.has('Rock golem')) {
		str += "\nYou have a funny feeling you're being followed...";
		globalClient.emit(
			Events.ServerNotification,
			`${Emoji.Mining} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received ${
				loot.amount('Rock golem') > 1 ? `${loot.amount('Rock golem')}x ` : 'a'
			} Rock golem while mining a fallen Shooting Star at level ${userMiningLevel} Mining!`
		);
	}

	handleTripFinish(user, data.channelID, str, undefined, data, loot);
}
