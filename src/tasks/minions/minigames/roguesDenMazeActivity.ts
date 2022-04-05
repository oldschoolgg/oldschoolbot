import { randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { roguesDenOutfit } from '../../../lib/data/CollectionsExport';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

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
		const userBankCopy = user.allItemsOwned();

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

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		const { image } = await this.client.tasks.get('bankImage')!.generateBankImage(
			itemsAdded,
			`Loot From ${quantity}x Rogues' Den maze`,
			false,
			{
				showNewCL: 1
			},
			user,
			previousCL
		);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['minigames', { rogues_den: {} }, true],
			gotLoot ? image! : undefined,
			data,
			itemsAdded
		);
	}
}
