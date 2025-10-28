import { percentChance, randInt } from '@oldschoolgg/rng';
import { Bank, EItem, type Item, Items } from 'oldschooljs';

import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import type { HerbloreActivityTaskOptions } from '@/lib/types/minions.js';
import { checkDegradeableItemCharges, degradeItem } from '../../lib/degradeableItems.js';

export const herbloreTask: MinionTask = {
	type: 'Herblore',
	async run(data: HerbloreActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { mixableID, quantity, zahur, wesley, channelID, duration } = data;

		const mixableItem = Herblore.Mixables.find(mixable => mixable.item.id === mixableID)!;
		const xpReceived = zahur && mixableItem.zahur ? 0 : quantity * mixableItem.xp;
		let outputQuantity = mixableItem.outputMultiple ? quantity * mixableItem.outputMultiple : quantity;
		let fourDoseItem: Item | null = null;
		let fourDoseCount = 0;
		const chemistryMessages: string[] = [];

		// Special case for Lava scale shard
		if (mixableItem.item.id === EItem.LAVA_SCALE_SHARD) {
			const hasWildyDiary = user.hasDiary('wilderness.hard');
			const currentHerbLevel = user.skillsAsLevels.herblore;
			let scales = 0;
			// Having 99 herblore gives a 98% chance to receive the max amount of shards
			const maxShardChance = currentHerbLevel >= 99 ? 98 : 0;
			// Completion of hard wilderness diary gives 50% more lava scale shards per lava scale, rounded down
			const diaryMultiplier = hasWildyDiary ? 1.5 : 1;

			if (wesley) {
				// Wesley always turns Lava scales into 3 lava scale shards
				scales = quantity * 3;
			} else {
				// Math for if the user is using their minion to make lava scale shards
				for (let i = 0; i < quantity; i++) {
					scales += Math.floor((rng.percentChance(maxShardChance) ? 6 : rng.randInt(3, 6)) * diaryMultiplier);
				}
			}
			outputQuantity = scales;
		}

		// Amulet of chemistry logic: only for hand-mixed (no Zahur/Wesley) 3-dose outputs
		if (!zahur && !wesley && mixableItem.item.name.includes('(3)')) {
			const chemistryItem = Items.getOrThrow('Amulet of chemistry');
			if (user.gear.skilling.hasEquipped(chemistryItem.id, false, false)) {
				const potentialFourDoseName = mixableItem.item.name.replace(/\(3\)/g, '(4)');
				const potentialFourDoseItem = Items.getItem(potentialFourDoseName);
				if (potentialFourDoseItem) {
					fourDoseItem = potentialFourDoseItem;

					const chemistryCharges = await checkDegradeableItemCharges({
						item: chemistryItem,
						user
					});

					let availableCharges = chemistryCharges;
					if (availableCharges > 0) {
						for (let i = 0; i < quantity && availableCharges > 0; i++) {
							if (percentChance(5)) {
								fourDoseCount++;
								availableCharges--;
							}
						}
						if (fourDoseCount > 0) {
							const degradeResult = await degradeItem({
								item: chemistryItem,
								chargesToDegrade: fourDoseCount,
								user
							});

							chemistryMessages.push(
								`${fourDoseCount}x ${fourDoseItem.name} were made thanks to your Amulet of chemistry.`
							);

							const chargesUsed = degradeResult.chargesToDegrade ?? 0;
							const remainingAfterDegrade = degradeResult.chargesRemaining;

							if (
								typeof chargesUsed === 'number' &&
								chargesUsed > 0 &&
								typeof remainingAfterDegrade === 'number'
							) {
								const chargeText = chargesUsed === 1 ? 'a charge' : `${chargesUsed} charges`;
								chemistryMessages.push(
									`Your Amulet of chemistry glows and loses ${chargeText} (${remainingAfterDegrade} left).`
								);
							}

							if (
								typeof degradeResult.userMessage === 'string' &&
								degradeResult.userMessage.includes('broke')
							) {
								chemistryMessages.push(degradeResult.userMessage);
							}
						}
					}
				}
			}
		}

		const xpRes = await user.addXP({ skillName: 'herblore', amount: xpReceived, duration });
		const loot = new Bank();

		if (fourDoseCount > 0 && fourDoseItem) {
			const threeDoseCount = Math.max(outputQuantity - fourDoseCount, 0);
			if (threeDoseCount > 0) {
				loot.add(mixableItem.item.id, threeDoseCount);
			}
			loot.add(fourDoseItem.id, fourDoseCount);
		} else {
			loot.add(mixableItem.item.id, outputQuantity);
		}

		await user.transactItems({ collectionLog: true, itemsToAdd: loot });

		let completionMessage: string;
		if (fourDoseCount > 0 && fourDoseItem) {
			const threeDoseCount = Math.max(outputQuantity - fourDoseCount, 0);
			completionMessage = `${user}, ${user.minionName} finished making ${threeDoseCount}x ${mixableItem.item.name} and ${fourDoseCount}x ${fourDoseItem.name}.`;
		} else {
			completionMessage = `${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.item.name}.`;
		}

		if (chemistryMessages.length > 0) {
			completionMessage = `${completionMessage} ${chemistryMessages.join(' ')}`;
		}

		completionMessage = `${completionMessage} ${xpRes}`;

		handleTripFinish(user, channelID, completionMessage, undefined, data, loot);
	}
};
