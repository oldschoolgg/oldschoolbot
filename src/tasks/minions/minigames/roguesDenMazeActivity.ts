import { randInt } from '@/lib/util/rng.js';
import { Bank, ItemGroups } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

function getLowestCountOutfitPiece(bank: Bank): number {
	let lowestCountPiece = 0;
	let lowestCountAmount = -1;

	for (const piece of ItemGroups.rogueOutfit) {
		const amount = bank.amount(piece);
		if (lowestCountAmount === -1 || amount < lowestCountAmount) {
			lowestCountPiece = piece;
			lowestCountAmount = amount;
		}
	}

	return lowestCountPiece;
}

export const roguesDenTask: MinionTask = {
	type: 'RoguesDenMaze',

	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);

		await user.incrementMinigameScore('rogues_den', quantity);

		const loot = new Bank();
		const userBankCopy = user.allItemsOwned.clone();

		let str = `<@${userID}>, ${user.minionName} finished completing ${quantity}x laps of the Rogues' Den Maze.`;

		for (let i = 0; i < quantity; i++) {
			if (randInt(1, 8) <= 5) {
				const piece = getLowestCountOutfitPiece(userBankCopy);
				userBankCopy.add(piece);
				loot.add(piece);
			}
		}

		const gotLoot = loot.length > 0;
		if (!gotLoot) {
			str += `\n**${user.minionName} failed to find any Rogue outfit pieces!**`;
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Rogues' Den maze`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, gotLoot ? image.file.attachment : undefined, data, itemsAdded);
	}
};
