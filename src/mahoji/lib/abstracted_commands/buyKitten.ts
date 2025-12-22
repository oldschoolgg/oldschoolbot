import { randArrItem } from '@oldschoolgg/rng';
import { Bank, Items } from 'oldschooljs';

import chatHeadImage from '@/lib/canvas/chatHeadImage.js';
import { kittens } from '@/lib/growablePets.js';

export async function buyKitten(user: MUser) {
	const cost = new Bank().add('Coins', 1000);

	let errorMsg: string | null = null;

	if (!user.owns(cost)) {
		errorMsg = "You don't have enough GP to buy a kitten! They cost 1000 coins.";
	}
	if (user.QP < 10) {
		errorMsg = "You haven't done enough quests to raise a kitten yet!";
	}

	const allItemsOwnedBank = user.allItemsOwned;
	if (kittens.some(kitten => allItemsOwnedBank.has(kitten))) {
		errorMsg = "You are already raising a kitten! You can't handle a second.";
	}
	if (errorMsg) {
		return {
			files: [
				await chatHeadImage({
					head: 'gertrude',
					content: errorMsg
				})
			]
		};
	}

	const kitten = Items.getOrThrow(randArrItem(kittens));

	const loot = new Bank().add(kitten.id);

	await user.transactItems({ itemsToRemove: cost, itemsToAdd: loot, collectionLog: true });

	return {
		files: [
			await chatHeadImage({
				head: 'gertrude',
				content: `Here's a ${kitten.name}, raise it well and take care of it, please!`
			})
		],
		content: `Removed ${cost} from your bank.`
	};
}
