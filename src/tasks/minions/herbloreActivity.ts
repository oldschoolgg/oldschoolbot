import { randInt } from 'e';
import { Bank, EItem, type Item } from 'oldschooljs';

import { checkDegradeableItemCharges, degradeItem } from '../../lib/degradeableItems';
import { WildernessDiary, userhasDiaryTier } from '../../lib/diaries';
import Herblore from '../../lib/skilling/skills/herblore/herblore';
import type { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import getOSItem from '../../lib/util/getOSItem';
import { percentChance } from '../../lib/util/rng';

export const herbloreTask: MinionTask = {
	type: 'Herblore',
	async run(data: HerbloreActivityTaskOptions) {
		const { mixableID, quantity, zahur, wesley, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const mixableItem = Herblore.Mixables.find(mixable => mixable.item.id === mixableID)!;
                const xpReceived = zahur && mixableItem.zahur ? 0 : quantity * mixableItem.xp;
                let outputQuantity = mixableItem.outputMultiple ? quantity * mixableItem.outputMultiple : quantity;
                let fourDoseItem: Item | null = null;
                let fourDoseCount = 0;
                const chemistryMessages: string[] = [];

		// Special case for Lava scale shard
		if (mixableItem.item.id === EItem.LAVA_SCALE_SHARD) {
			const [hasWildyDiary] = await userhasDiaryTier(user, WildernessDiary.hard);
			const currentHerbLevel = user.skillsAsLevels.herblore;
			let scales = 0;
			// Having 99 herblore gives a 98% chance to recieve the max amount of shards
			const maxShardChance = currentHerbLevel >= 99 ? 98 : 0;
			// Completion of hard wilderness diary gives 50% more lava scale shards per lava scale, rounded down
			const diaryMultiplier = hasWildyDiary ? 1.5 : 1;

			if (wesley) {
				// Wesley always turns Lava scales into 3 lava scale shards
				scales = quantity * 3;
			} else {
				// Math for if the user is using their minion to make lava scale shards
				for (let i = 0; i < quantity; i++) {
					scales += Math.floor((percentChance(maxShardChance) ? 6 : randInt(3, 6)) * diaryMultiplier);
				}
			}
                        outputQuantity = scales;
                }

                if (!zahur && !wesley && mixableItem.item.name.includes('(3)')) {
                        const chemistryItem = getOSItem('Amulet of chemistry');
                        if (user.gear.skilling.hasEquipped(chemistryItem.id, false, false)) {
                                const potentialFourDoseName = mixableItem.item.name
                                        .replace(' (3)', '(4)')
                                        .replace('(3)', '(4)');
                                try {
                                        fourDoseItem = getOSItem(potentialFourDoseName);
                                } catch {
                                        fourDoseItem = null;
                                }
                                if (fourDoseItem) {
                                        const chemistryCharges = await checkDegradeableItemCharges({
                                                item: chemistryItem,
                                                user
                                        });
                                        let chargesRemaining = chemistryCharges;
                                        if (chargesRemaining > 0) {
                                                for (let i = 0; i < quantity && chargesRemaining > 0; i++) {
                                                        if (percentChance(5)) {
                                                                fourDoseCount++;
                                                                chargesRemaining--;
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
                                                        if (degradeResult.userMessage.includes('broke')) {
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

                await transactItems({ userID: user.id, collectionLog: true, itemsToAdd: loot });

                let completionMessage = `${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.item.name}.`;
                if (chemistryMessages.length > 0) {
                        completionMessage = `${completionMessage} ${chemistryMessages.join(' ')}`;
                }
                completionMessage = `${completionMessage} ${xpRes}`;

                handleTripFinish(
                        user,
                        channelID,
                        completionMessage,
                        undefined,
                        data,
                        loot
                );
	}
};
