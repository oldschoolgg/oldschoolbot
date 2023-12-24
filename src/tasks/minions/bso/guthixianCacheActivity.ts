import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { divinersOutfit } from '../../../lib/data/CollectionsExport';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { percentChance, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const guthixianCacheTask: MinionTask = {
	type: 'GuthixianCache',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		let { userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		let xp = user.skillLevel('divination') * user.skillLevel('divination') * 2.5;
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Divination,
			amount: xp,
			source: 'GuthixianCache',
			duration
		});

		const loot = new Bank();
		if (percentChance(40)) {
			const unownedPiece = divinersOutfit.find(piece => !user.allItemsOwned.has(piece));
			if (unownedPiece) {
				loot.add(unownedPiece);
			}
			if (roll(1_000_000)) {
				loot.add('Doopy');
			}
		}

		let str = `${user.minionName} finished completing the Guthixian Cache. ${xpRes}`;

		if (loot.length > 0) {
			await user.addItemsToBank({
				items: loot,
				collectionLog: true
			});
			str += `\n${loot.has('Doopy') ? `${Emoji.Purple} ` : ''}You received: ${loot}.`;
		}

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
