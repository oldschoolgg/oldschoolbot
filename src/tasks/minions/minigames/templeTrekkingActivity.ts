import { stringMatches } from '@oldschoolgg/toolkit/string-util';
import { Bank, ItemGroups, Items } from 'oldschooljs';

import {
	EasyEncounterLoot,
	HardEncounterLoot,
	MediumEncounterLoot,
	rewardTokens
} from '@/lib/minions/data/templeTrekking.js';
import type { TempleTrekkingActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { percentChance, randInt } from '@/lib/util/rng.js';

function getLowestCountOutfitPiece(bank: Bank, user: MUser): number {
	let lowestCountPiece = 0;
	let lowestCountAmount = -1;

	for (const piece of ItemGroups.templeTrekkingOutfit) {
		let amount = bank.amount(piece);

		for (const setup of Object.values(user.gear)) {
			const thisItemEquipped = Object.values(setup).find(setup => setup?.item === piece);
			if (thisItemEquipped) amount += thisItemEquipped.quantity;
		}

		if (lowestCountAmount === -1 || amount < lowestCountAmount) {
			lowestCountPiece = piece;
			lowestCountAmount = amount;
		}
	}

	return lowestCountPiece;
}

export const templeTrekkingTask: MinionTask = {
	type: 'Trekking',

	async run(data: TempleTrekkingActivityTaskOptions) {
		const { channelID, quantity, userID, difficulty } = data;
		const user = await mUserFetch(userID);
		await user.incrementMinigameScore('temple_trekking', quantity);
		const userBank = user.bank.clone();
		const loot = new Bank();

		const rewardToken = stringMatches(difficulty, 'hard')
			? Items.getOrThrow(rewardTokens.hard)
			: stringMatches(difficulty, 'medium')
				? Items.getOrThrow(rewardTokens.medium)
				: Items.getOrThrow(rewardTokens.easy);

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
				} else if (percentChance(3)) {
					const piece = getLowestCountOutfitPiece(userBank, user);
					userBank.add(piece);
					loot.add(piece);
				}

				totalEncounters++;
			}

			// Add 1 reward token per trip
			loot.add(rewardToken.id);
		}

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const str = `${user}, ${user.minionName} finished Temple Trekking ${quantity}x times. ${totalEncounters}x encounters were defeated.`;

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Temple Treks`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
