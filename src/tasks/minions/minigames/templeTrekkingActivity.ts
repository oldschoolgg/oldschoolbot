import { randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { lumberjackOutfit } from '../../../lib/data/collectionLog';
import { EasyEncounterLoot, HardEncounterLoot, MediumEncounterLoot, rewardTokens } from '../../../lib/minions/data/templeTrekking';
import { TempleTrekkingActivityTaskOptions } from '../../../lib/types/minions';
import { percentChance, stringMatches } from '../../../lib/util';
import getOSItem from '../../../lib/util/getOSItem';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	getLowestCountOutfitPiece(bank: Bank): number {
		let lowestCountPiece = 0;
		let lowestCountAmount = -1;

		for (const piece of lumberjackOutfit) {
			const amount = bank.amount(piece);
			if (lowestCountAmount === -1 || amount < lowestCountAmount) {
				lowestCountPiece = piece;
				lowestCountAmount = amount;
			}
		}

		return lowestCountPiece;
	}

	async run(data: TempleTrekkingActivityTaskOptions) {
		const { channelID, quantity, userID, difficulty } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinigameScore('TempleTrekking', quantity);
		const userBank = user.bank();
		let loot = new Bank();

		const rewardToken = stringMatches(difficulty, 'hard')
			? getOSItem(rewardTokens.hard)
			: stringMatches(difficulty, 'medium')
			? getOSItem(rewardTokens.medium)
			: getOSItem(rewardTokens.easy);

		let totalEncounters = 0;
		for (let trip = 0; trip < quantity; trip++) {
			const encounters = stringMatches(difficulty, 'hard')
				? randInt(0, 7)
				: stringMatches(difficulty, 'medium')
				? randInt(0, 4)
				: randInt(0, 5);

			for (let i = 0; i < encounters; i++) {
				// 2 out of 12 encounters drop loot, 16%
				if (percentChance(16)) {
					if (stringMatches(difficulty, 'hard')) {
						loot.add(HardEncounterLoot.roll());
					} else if (stringMatches(difficulty, 'medium')) {
						loot.add(MediumEncounterLoot.roll());
					} else {
						loot.add(EasyEncounterLoot.roll());
					}
				} else if (percentChance(5)) {
					// Of the remaining 10 encounters, 10% have a 50% chance of spawning lumberjacks
					const piece = this.getLowestCountOutfitPiece(userBank);
					userBank.add(piece);
					loot.add(piece);
				}

				totalEncounters++;
			}

			// Add 1 reward token per trip
			loot.add(rewardToken.id);
		}

		await user.addItemsToBank(loot, true);

		let str = `${user}, ${user.minionName} finished Temple Trekking ${quantity}x times. ${totalEncounters}x encounters were defeated.`;

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(loot.bank, `Loot From ${quantity}x Temple Treks:`, true, { showNewCL: 1 }, user);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x treks`);
				return this.client.commands.get('trek')!.run(res, []);
			},
			image!,
			data,
			loot.bank
		);
	}
}
