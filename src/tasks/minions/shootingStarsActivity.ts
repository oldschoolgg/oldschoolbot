import { Bank } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import type { ShootingStarsOptions } from '@/lib/types/minions.js';
import { starSizes } from '@/mahoji/lib/abstracted_commands/shootingStarsCommand.js';

export const shootingStarTask: MinionTask = {
	type: 'ShootingStars',
	async run(data: ShootingStarsOptions, { handleTripFinish, user }) {
		const star = starSizes.find(i => i.size === data.size)!;
		const { usersWith } = data;
		const itemsToAdd = new Bank(data.lootItems);

		await user.transactItems({ itemsToAdd, collectionLog: true });
		const xpStr = await user.addXP({
			skillName: 'mining',
			amount: data.totalXp,
			duration: data.duration
		});

		const str = `${user}, ${user.minionName} finished mining a size ${star.size} Crashed Star, there was ${
			usersWith - 1 || 'no'
		} other players mining with you.\nYou received ${itemsToAdd}.\n${xpStr}`;
		if (itemsToAdd.has('Rock golem') && !user.bitfield.includes(BitField.HasEarnedRiftGuardianFromStar)) {
			await user.update({
				bitfield: {
					push: BitField.HasEarnedRiftGuardianFromStar
				}
			});
		}

		return handleTripFinish({ user, channelId: data.channelId, message: str, data, loot: itemsToAdd });
	}
};
