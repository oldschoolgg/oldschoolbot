import { randArrItem } from 'e';
import { Bank } from 'oldschooljs';

import { mahojiChatHead } from '../../../lib/canvas/chatHeadImage.js';
import { kittens } from '../../../lib/growablePets.js';
import getOSItem from '../../../lib/util/getOSItem.js';

export async function buyKitten(user: MUser) {
	const cost = new Bank().add('Coins', 1000);
	if (!user.owns(cost)) {
		return mahojiChatHead({
			head: 'gertrude',
			content: "You don't have enough GP to buy a kitten! They cost 1000 coins."
		});
	}
	if (user.QP < 10) {
		return mahojiChatHead({
			head: 'gertrude',
			content: "You haven't done enough quests to raise a kitten yet!"
		});
	}

	const allItemsOwnedBank = user.allItemsOwned;
	if (kittens.some(kitten => allItemsOwnedBank.has(kitten))) {
		return mahojiChatHead({
			head: 'gertrude',
			content: "You are already raising a kitten! You can't handle a second."
		});
	}

	const kitten = getOSItem(randArrItem(kittens));

	const loot = new Bank().add(kitten.id);

	await user.transactItems({ itemsToRemove: cost, itemsToAdd: loot, collectionLog: true });

	return {
		...(await mahojiChatHead({
			head: 'gertrude',
			content: `Here's a ${kitten.name}, raise it well and take care of it, please!`
		})),
		content: `Removed ${cost} from your bank.`
	};
}
