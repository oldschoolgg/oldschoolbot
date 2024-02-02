import { roll } from 'e';
import { Bank } from 'oldschooljs';

import { chargePortentIfHasCharges, PortentID } from '../../../lib/bso/divination';
import { Emoji } from '../../../lib/constants';
import { divinersOutfit } from '../../../lib/data/CollectionsExport';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { percentChance } from '../../../lib/util';
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
		}

		let str = `${user}, ${user.minionName} finished completing the Guthixian Cache. ${xpRes}`;

		let amountOfBoostsReceived = 1;
		if (user.hasEquipped('Divination master cape') && roll(4)) {
			amountOfBoostsReceived++;
			str += ' You received an extra boost from your Divination master cape.';
		}
		const cacheBoostLoot = new Bank().add('Guthixian cache boost', amountOfBoostsReceived);

		const portentResult = await chargePortentIfHasCharges({
			user,
			portentID: PortentID.CachePortent,
			charges: amountOfBoostsReceived
		});

		if (portentResult.didCharge) {
			loot.add(cacheBoostLoot);
			str += `\nYour Cache portent gave you ${cacheBoostLoot}, your portent now has ${portentResult.portent.charges_remaining} charges remaining.`;
		} else {
			await user.update({
				guthixian_cache_boosts_available: {
					increment: amountOfBoostsReceived
				}
			});
			str += `\nYou received ${
				amountOfBoostsReceived === 1
					? 'a Guthixian cache boost'
					: `${amountOfBoostsReceived}x Guthixian cache boosts`
			}, your next memory harvesting trip will be enhanced.`;
		}
		if (loot.length > 0) {
			await user.addItemsToBank({
				items: loot,
				collectionLog: true
			});
			str += `\n${loot.has('Doopy') ? `${Emoji.Purple} ` : ''}You received: ${loot}.`;
		}

		await user.addToGodFavour(['Guthix'], data.duration);

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
