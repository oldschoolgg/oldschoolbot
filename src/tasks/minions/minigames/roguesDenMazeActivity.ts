import { randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { roguesDenOutfit } from '../../../lib/data/CollectionsExport';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { allItemsOwned } from '../../../mahoji/mahojiSettings';

export default class extends Task {
	getLowestCountOutfitPiece(bank: Bank): number {
		let lowestCountPiece = 0;
		let lowestCountAmount = -1;

		for (const piece of roguesDenOutfit) {
			const amount = bank.amount(piece);
			if (lowestCountAmount === -1 || amount < lowestCountAmount) {
				lowestCountPiece = piece;
				lowestCountAmount = amount;
			}
		}

		return lowestCountPiece;
	}

	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, quantity, userID } = data;

		incrementMinigameScore(userID, 'rogues_den', quantity);

		const loot = new Bank();
		const user = await this.client.fetchUser(userID);
		const userBankCopy = allItemsOwned(user);

		let str = `<@${userID}>, ${user.minionName} finished completing ${quantity}x laps of the Rogues' Den Maze.`;

		for (let i = 0; i < quantity; i++) {
			if (randInt(1, 8) <= 5) {
				const piece = this.getLowestCountOutfitPiece(userBankCopy);
				userBankCopy.add(piece);
				loot.add(piece);
			}
		}

		const gotLoot = loot.length > 0;
		if (!gotLoot) {
			str += `\n**${user.minionName} failed to find any Rogue outfit pieces!**`;
		}

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Rogues' Den maze`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { rogues_den: {} }, true],
			gotLoot ? image.file.buffer : undefined,
			data,
			itemsAdded
		);
	}
}
